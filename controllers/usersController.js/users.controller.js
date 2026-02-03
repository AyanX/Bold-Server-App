const { users } = require("../../drizzle/schema");
const db = require("../../db/db");
const { eq, like } = require("drizzle-orm");
const crypto = require("crypto");
const {hashPassword} = require("../../utils/bcrypt/bcrypt");

//  Format datetime for MySQL
const getMySQLDateTime = () => {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
};

/**
 * GET /api/users
 * Fetch all users with optional search
 */
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = db.select().from(users);


    const allUsers = await query;

    // Remove passwords from response
    const safeUsers = allUsers.map((user) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    console.log(`👥 Fetched ${safeUsers.length} users`);

    return res.status(200).json({
      data: safeUsers,
      status: 200,
      message: "Users fetched successfully",
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

/**
 * POST /api/users
 * Create a new user
 */
const createUser = async (req, res) => {
  console.log("Creating user with data:", req.body);
  //invited users handled here
  try {
    const { name, email, linkedin, role, bio, image} = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(422).json({
        message: "Validation failed",
        status: 422,
        errors: { name: ["The name field is required."] },
      });
    }

    if (!email || email.trim().length === 0) {
      return res.status(422).json({
        message: "Validation failed",
        status: 422,
        errors: { email: ["The email field is required."] },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(422).json({
        message: "Validation failed",
        status: 422,
        errors: { email: ["The email must be a valid email address."] },
      });
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

      //email exists => return
    if (existingUser.length > 0) {
      return res.status(422).json({
        message: "Validation failed",
        status: 422,
        errors: { email: ["This email is already registered."] },
      });
    }

    // Insert new user
    const now = getMySQLDateTime();

    await db.insert(users).values({
      name: name.trim(),
      email: email.toLowerCase(),
      role: role || "Contributor",
      status: "Pending",
      bio: bio || null,
      image: image || null,
      linkedin:linkedin|| null,
      created_at: now,
      updated_at: now,
    });

    // Fetch created user (without password)
    const newUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    const { password: _, ...safeUser } = newUser[0];

    console.log(`User created:`, safeUser.email);

    return res.status(201).json({
      data: safeUser,
      message: "User created successfully",
      status: 201,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

/**
 * GET /api/users/:id
 * Fetch a single user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid user ID",
        status: 400,
      });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }

    // Remove password
    const { password, ...safeUser } = user[0];

    console.log(`👤 Fetched user:`, safeUser.email);

    return res.status(200).json({
      data: safeUser,
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

/**
 * PUT /api/users/:id
 * Update a user by ID
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, bio, image, department, phone } = req.body;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid user ID",
        status: 400,
      });
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }

    // Build update object
    const updateData = {};

    // Validate and add name
    if (name !== undefined && name.trim().length > 0) {
      updateData.name = name.trim();
    }

    // Validate and add email (check uniqueness if changed)
    if (email !== undefined && email.trim().length > 0) {
      const emailLower = email.toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(emailLower)) {
        return res.status(422).json({
          message: "Validation failed",
          status: 422,
          errors: { email: ["The email must be a valid email address."] },
        });
      }

      // Check if email is already taken by another user
      if (emailLower !== existingUser[0].email) {
        const duplicate = await db
          .select()
          .from(users)
          .where(eq(users.email, emailLower))
          .limit(1);

        if (duplicate.length > 0) {
          return res.status(422).json({
            message: "Validation failed",
            status: 422,
            errors: { email: ["This email is already registered."] },
          });
        }
      }

      updateData.email = emailLower;
    }

    // Add optional fields
    if (role !== undefined) updateData.role = role;
    if (bio !== undefined) updateData.bio = bio || null;
    if (image !== undefined) updateData.image = image || null;
    if (department !== undefined) updateData.department = department || null;
    if (phone !== undefined) updateData.phone = phone || null;

    // Always update timestamp
    updateData.updated_at = getMySQLDateTime();

    // Update user
    await db.update(users).set(updateData).where(eq(users.id, Number(id)));

    // Fetch updated user
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)))
      .limit(1);

    // Remove password
    const { password: _, ...safeUser } = updatedUser[0];

    console.log(`✏️ User updated:`, safeUser.email);

    return res.status(200).json({
      data: safeUser,
      message: "User updated successfully",
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

/**
 * DELETE /api/users/:id
 * Delete a user by ID
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid user ID",
        status: 400,
      });
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }

    const userName = existingUser[0].name;

    // Delete user
    await db.delete(users).where(eq(users.id, Number(id)));

    console.log(` User deleted:`, userName);

    return res.status(200).json({
      message: "User deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error(" Error deleting user:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
