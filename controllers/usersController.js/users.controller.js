const { users, userInvitations, articles } = require("../../drizzle/schema");
const db = require("../../db/db");
const { eq, like } = require("drizzle-orm");
const crypto = require("crypto");
const { safeUser } = require("../utils");

//  Format datetime for MySQL
const getMySQLDateTime = () => {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
};

const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = db.select().from(users);

    const allUsers = await query;

    // Remove passwords from response
    const safeUsers = allUsers.map((user) => safeUser(user));

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

    const userData = safeUser(user[0]);

    return res.status(200).json({
      data: userData,
      status: 200,
    });
  } catch (error) {
    console.error(" Error fetching user:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, bio, image, department, phone, linkedin } =
      req.body;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid user ID",
        status: 400,
      });
    }

    //track name change to update articles authors if the name is changed
    let isNameChanged = false;

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
      if (name.trim() !== existingUser[0].name) {
        isNameChanged = true;
      }
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
    if (linkedin !== undefined) updateData.linkedin = linkedin || null;

    // Always update timestamp
    updateData.updated_at = getMySQLDateTime();

    // ensure that the user is not trying to update another user's profile if they are not an admin
    if (req.user.id !== Number(id) && req.user.role.toLowerCase() !== "admin") {
      console.log(
        "Unauthorized update attempt by user:",
        req.user.id,
        "on user:",
        id,
      );
      console.log("User role:", req.user.role);

      return res.status(403).json({
        message: "Forbidden: You can only update your own profile",
        status: 403,
      });
    }

    // Ensure that the user is not trying to change their own role  if they are not an admin
    if (req.user.role.toLowerCase() !== "admin") {
      if (updateData.role !== undefined) {
        return res.status(403).json({
          message: "Forbidden: Only admins can change roles or emails",
          status: 403,
        });
      }
    }

    // Update user
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, Number(id)));

    // the new user object after update
    const [newUpdatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)))
      .limit(1);

    // Remove password and sensitive info from response

    res.status(200).json({
      data: safeUser(newUpdatedUser),
      message: "User updated successfully",
      status: 200,
    });

    // if the name is changed, update the author name in articles as well in the background to maintain consistency

    if (!isNameChanged && !updateData.image) {
      return;
    }

    // only update the author name and image in articles if the name or image is changed to avoid unnecessary updates
    const dataToUpdate = {};

    if (isNameChanged) {
      dataToUpdate.author = name.trim();
    }

    if (updateData.image) {
      dataToUpdate.author_image = image;
    }

    await db
      .update(articles)
      .set(dataToUpdate)
      .where(eq(articles.author_id, Number(id)));

    return;
  } catch (error) {
    console.error(" Error updating user:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

const deleteUser = async (req, res) => {
  const { id: adminId } = req.user; // ID of the user making the request

  if (!adminId) {
    console.log("Unauthorized delete attempt: No user ID in request");
    return res.status(401).json({
      message: "Unauthorized: User ID not found in request",
      status: 401,
    });
  }

  try {
    const { id } = req.params;

    // check if request was sent by an admin

    if (req.user.role.toLowerCase() !== "admin") {
      return res.status(403).json({
        message: "Forbidden: Only admins can delete users",
        status: 403,
      });
    }

    console.log("Delete user request by admin ID:", adminId); // Debug log

    // confirm user role before deletion to prevent unauthorized deletions
    const userRole = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(adminId)))
      .limit(1);

    console.log("User role for deletion attempt by:", userRole[0].role); // Debug log

    if (userRole.length === 0 || userRole[0].role.toLowerCase() !== "admin") {
      return res.status(403).json({
        message: "Forbidden: Only admins can delete users",
        status: 403,
      });
    }

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

    console.log("Existing user for deletion:", existingUser[0]);

    if (existingUser.length === 0) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }

    // Delete user
    await db.delete(users).where(eq(users.id, Number(id)));

    //change invitation status to suspended if the user is deleted
    await db
      .update(userInvitations)
      .set({ status: "suspended" })
      .where(eq(userInvitations.id, existingUser[0].id));

    res.status(200).json({
      message: "User deleted successfully",
      status: 200,
    });

    // delete user token if it exists

    await db.delete().return;
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
  getUserById,
  updateUser,
  deleteUser,
};
