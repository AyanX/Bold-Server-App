//      /api/settings/profile
const db = require("../../db/db");
const { users, articles } = require("../../drizzle/schema");
const { eq } = require("drizzle-orm");

const {
  uploadImageHelper,
  getUser,
  sensitiveFields,
  safeUser,
} = require("../utils");

const uploadProfileImage = async (req, res) => {
  if (!req.user.id) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized",
    });
  }

  try {
    // Build relative path from uploaded file
    const { path: relativePath, url: publicUrl } = uploadImageHelper(req, res);

    //update user's profile image path in database
    await db
      .update(users)
      .set({ image: publicUrl })
      .where(eq(users.id, Number(req.user.id)));

    console.log(
      `User ${req.user.id} profile image updated successfully in database.`,
    );

    res.status(200).json({
      status: 200,
      message: "Image uploaded successfully",
      data: {
        path: relativePath,
        url: publicUrl,
        filename: req.file?.originalname,
      },
    });

    //update user articles author img in db

    await db
      .update(articles)
      .set({ author_image: publicUrl })
      .where(eq(articles.author_id, Number(req.user.id)));

    console.log(
      `User ${req.user.name} articles author image updated successfully in database.`,
    );

    return;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    if (error.message === "Unauthorized") {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const { email } = getUser(req, res);

    //fetch user from database
    const userFound = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userFound.length === 0) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }

    const safeUserDetails = safeUser(userFound[0]);

    return res.status(200).json({
      data: safeUserDetails,
      message: "User profile fetched successfully",
      status: 200,
    });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return res.status(401).json({
        message: "Unauthorized",
        status: 401,
      });
    }
    console.error("❌ Error fetching user profile:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = getUser(req, res);

    // Extract fields to update from req.body (e.g., name, bio, email)
    const { name, bio, email } = req.body;

    //fetch the user from database
    const userFound = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)))
      .limit(1);

    if (userFound.length === 0) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }

    const existingUser = userFound[0];

    // track name changed to update articles authors if the name is changed
    const isNameChanged =
      name && name.trim().toLowerCase() !== existingUser.name.toLowerCase();

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (email !== undefined) updateData.email = email;

    // Only update if at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
        status: 400,
      });
    }

    // Update user in database
    await db.update(users).set(updateData).where(eq(users.id, id));

    // Fetch updated user
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (updatedUser.length === 0) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }

    // Return safe user data
    const safeUserData = safeUser(updatedUser[0]);

    res.status(200).json({
      data: safeUserData,
      message: "Profile updated successfully",
      status: 200,
    });

    // if the name is changed, update the author name in articles as well in the background to maintain consistency

    if (!isNameChanged) {
      return;
    }

    await db
      .update(articles)
      .set({
        author: name.trim(),
      })
      .where(eq(articles.author_id, Number(id)));

    return;
  } catch (error) {
    if (error.message === "Unauthorized") {
      return res.status(401).json({
        message: "Unauthorized",
        status: 401,
      });
    }
    console.error(" Error updating profile:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  uploadProfileImage,
  getProfile,
  updateProfile,
};
