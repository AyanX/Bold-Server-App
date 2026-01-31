// api/settings
const db = require("../../db/db");
const { settings, users } = require("../../drizzle/schema");
const { eq } = require("drizzle-orm");
const { getMySQLDateTime, getUser } = require("../utils");
const { hashPassword, comparePassword } = require("../../utils/bcrypt/bcrypt");

const getSettings = async (req, res) => {
  try {
    const allSettings = await db.select().from(settings);

    // Parse values based on type before sending
    const parsedSettings = allSettings.map((setting) => {
      let parsedValue = setting.value;
      switch (setting.type) {
        case "boolean":
          parsedValue = setting.value === "true" || setting.value === "1";
          break;
        case "number":
          parsedValue = parseFloat(setting.value);
          if (isNaN(parsedValue)) parsedValue = 0;
          break;
        case "integer":
          parsedValue = parseInt(setting.value, 10);
          if (isNaN(parsedValue)) parsedValue = 0;
          break;
        default:
          // string or unknown, keep as is
          break;
      }
      return {
        ...setting,
        value: parsedValue,
      };
    });

    return res.status(200).json({
      status: 200,
      message: "Settings fetched successfully",
      data: parsedSettings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const putSettings = async (req, res) => {
  const dateUpdated = getMySQLDateTime();
  const settingsData = req.body;

  try {
    // Update each setting key with the new value and updatedAt
    for (const [key, value] of Object.entries(settingsData)) {
      await db
        .update(settings)
        .set({ value: value, updatedAt: dateUpdated })
        .where(eq(settings.key, key));
    }

    // Fetch all settings after update
    const allSettings = await db.select().from(settings);

    return res.status(200).json({
      status: 200,
      message: "Settings updated successfully",
      data: allSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const passwordUpdate = async (req, res) => {
  const { email } = getUser(req, res);
  const { current_password, password, password_confirmation } = req.body;

 try {
    // Fetch user by email
    const userFound = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
    //if user not found return 404
  if (userFound.length === 0) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }
    const user = userFound[0];
  
    // Check if current password matches
    const isMatch = await comparePassword(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 400,
        message: "Current password is incorrect",
      });
    }
  
    // Check if new password and confirmation match
    if (password !== password_confirmation) {
      return res.status(400).json({
        status: 400,
        message: "Password confirmation does not match",
      });
    }
  
    // Hash the new password
    const hashedPassword = await hashPassword(password);
  
    // Update user's password in the database
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: getMySQLDateTime() })
      .where(eq(users.email, email));
  
    return res.status(200).json({
      status: 200,
      message: "Password updated successfully",
    });

 } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
 }



};

module.exports = {
  getSettings,
  putSettings,
  passwordUpdate,
};
