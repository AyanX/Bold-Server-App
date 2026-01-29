const { userInvitations, users } = require("../../drizzle/schema");
const db = require("../../db/db");
const { eq, and } = require("drizzle-orm");
const { hashPassword, comparePassword } = require("../../utils/bcrypt/bcrypt");
const transporter = require("../../mailer/nodemailer.config");
const fs = require('fs').promises;
const crypto = require("crypto");

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Generate a secure 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return String(Math.floor(Math.random() * 900000) + 100000);
};

/**
 * Generate a secure token for invitation links
 * @returns {string} Secure random token
 */
const generateInvitationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash OTP code
 * @param {string} otp - OTP to hash
 * @returns {Promise<string>} Hashed OTP
 */
const hashOTP = async (otp) => {
  return await hashPassword(otp);
};

/**
 * Get MySQL datetime format
 * @returns {string} Current datetime in MySQL format
 */
const getMySQLDateTime = () => {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
};

/**
 * Calculate OTP expiration time (15 minutes from now)
 * @returns {string} Expiration datetime in MySQL format
 */
const getOTPExpirationTime = () => {
  const expirationDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return expirationDate.toISOString().replace("T", " ").slice(0, 19);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { isValid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one digit");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Send invitation email with OTP
 * @param {object} params - Email parameters
 * @returns {Promise<void>}
 */
const sendInvitationEmail = async ({ email, name, otp, role, inviterName = "Admin" }) => {
  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: `You're Invited to Join Bold - Your OTP is ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
            <h2 style="color: #333; margin: 0;">Welcome to Bold</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hi <strong>${name}</strong>,</p>
            <p>${inviterName} has invited you to join <strong>Bold</strong> as a <strong>${role}</strong>.</p>
            <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">Your One-Time Password (OTP) is:</p>
              <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 2px;">${otp}</p>
              <p style="margin: 0; color: #666; font-size: 12px;">Valid for 15 minutes</p>
            </div>
            <p>Use this OTP to activate your account and set up your password.</p>
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
              If you did not request this invitation, please ignore this email.
            </p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Bold. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Invitation email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send invitation email to ${email}:`, error);
    throw new Error("Failed to send invitation email");
  }
};

/**
 * ============================================================================
 * CONTROLLER FUNCTIONS
 * ============================================================================
 */

/**
 * POST /api/users/invite
 * Create a new user invitation with OTP
 */
const inviteUser = async (req, res) => {
  try {
    const { name, email, role, department, phone, bio } = req.body;
    const invitedBy = req.user?.id || null; // Assumes middleware sets req.user

    // Validation
    if (!name || !email || !role) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields: name, email, role",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid email format",
      });
    }

    // Check if user already invited
    const existingInvite = await db
      .select()
      .from(userInvitations)
      .where(eq(userInvitations.email, email))
      .limit(1);

    if (existingInvite.length > 0) {
      return res.status(409).json({
        status: 409,
        message: "User with this email has already been invited",
      });
    }

    // Generate OTP and hash it
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const otpExpiresAt = getOTPExpirationTime();
    const now = getMySQLDateTime();

    // Insert invitation into database
    const invitation = await db.insert(userInvitations).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role || "Contributor",
      department: department || null,
      phone: phone || null,
      bio: bio || null,
      otpCode: otp, // Store plain OTP for email (remove in production, use token instead)
      otpHash: otpHash,
      otpExpiresAt: otpExpiresAt,
      invitedBy: invitedBy,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Send invitation email
    await sendInvitationEmail({
      email,
      name,
      otp,
      role,
      inviterName: req.user?.name || "Admin",
    });

    console.log(`User invitation created for ${email} with ID: ${invitation.insertId}`);

    return res.status(201).json({
      status: 201,
      message: "Invitation sent successfully",
      data: {
        id: invitation.insertId,
        email,
        name,
        role,
        status: "pending",
        createdAt: now,
      },
    });
  } catch (error) {
    console.error("❌ Error creating invitation:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/users/invite/image
 * Upload image during invitation process
 * 
 * Request: multipart/form-data with image file only
 */
const uploadInviteImage = async (req, res) => {
  try {
    // Check if file was uploaded by multer
    if (!req.file) {
      return res.status(422).json({
        status: 422,
        message: "Validation failed",
        errors: {
          image: ["The image field is required"],
        },
      });
    }

    // Build relative path from uploaded file
    const relativePath = `users/${req.file.filename}`;
    
    // Return path and public URL
    const baseUrl = process.env.APP_URL || "http://localhost:8000";
    const publicUrl = `${baseUrl}/storage/${relativePath}`;

    console.log(`Image uploaded successfully: ${req.file.filename}`);

    return res.status(200).json({
      status: 200,
      message: "Image uploaded successfully",
      data: {
        path: relativePath,
        url: publicUrl,
        filename: req.file.originalname,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to upload image",
      error: error.message,
    });
  }
};

/**
 * POST /api/users/accept-invitation
 * Accept invitation and create user account
 */
const acceptInvitation = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword, name } = req.body;

    // Validation
    if (!email || !otp || !password || !name) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields: email, otp, password, name",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Passwords do not match",
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        status: 400,
        message: "Password does not meet security requirements",
        errors: passwordValidation.errors,
      });
    }

    // Find invitation
    const invitation = await db
      .select()
      .from(userInvitations)
      .where(eq(userInvitations.email, email.toLowerCase().trim()))
      .limit(1);

    if (invitation.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Invitation not found",
      });
    }

    const invitationRecord = invitation[0];

    // Check if already accepted
    if (invitationRecord.status === "accepted") {
      return res.status(409).json({
        status: 409,
        message: "Invitation has already been accepted",
      });
    }

    // Check if expired
    if (new Date(invitationRecord.otpExpiresAt) < new Date()) {
      return res.status(410).json({
        status: 410,
        message: "Invitation has expired. Please request a new invitation.",
      });
    }

    // Verify OTP
    const isOTPValid = await comparePassword(otp, invitationRecord.otpHash);
    if (!isOTPValid) {
      return res.status(401).json({
        status: 401,
        message: "Invalid OTP code",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    const now = getMySQLDateTime();

    // Create user account
    const newUser = await db.insert(users).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: invitationRecord.role || "Contributor",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Update invitation status to accepted
    await db
      .update(userInvitations)
      .set({
        status: "accepted",
        updatedAt: now,
      })
      .where(eq(userInvitations.id, invitationRecord.id));

    console.log(`✅ User ${email} accepted invitation and account created with ID: ${newUser.insertId}`);

    return res.status(201).json({
      status: 201,
      message: "Account created successfully",
      data: {
        id: newUser.insertId,
        name,
        email,
        role: invitationRecord.role,
        status: "active",
      },
    });
  } catch (error) {
    console.error("❌ Error accepting invitation:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

/**
 * GET /api/users/invitations/list
 * Get list of all invitations (with optional filters)
 */
const getInvitationsList = async (req, res) => {
  try {
    const { status, role, search } = req.query;

    let query = db.select().from(userInvitations);

    if (status) {
      query = query.where(eq(userInvitations.status, status));
    }

    if (role) {
      query = query.where(eq(userInvitations.role, role));
    }

    const invitations = await query;

    console.log(`📋 Fetched ${invitations.length} invitations`);

    return res.status(200).json({
      status: 200,
      message: "Invitations fetched successfully",
      data: invitations,
    });
  } catch (error) {
    console.error("❌ Error fetching invitations:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/users/invitations/:id/resend
 * Resend invitation email with new OTP
 */
const resendInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Missing invitation ID",
      });
    }

    // Find invitation
    const invitation = await db
      .select()
      .from(userInvitations)
      .where(eq(userInvitations.id, parseInt(id)))
      .limit(1);

    if (invitation.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Invitation not found",
      });
    }

    const invitationRecord = invitation[0];

    // Check if already accepted
    if (invitationRecord.status === "accepted") {
      return res.status(409).json({
        status: 409,
        message: "Invitation has already been accepted",
      });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    const newOTPHash = await hashOTP(newOTP);
    const newOTPExpiresAt = getOTPExpirationTime();
    const now = getMySQLDateTime();

    // Update invitation with new OTP
    await db
      .update(userInvitations)
      .set({
        otpCode: newOTP,
        otpHash: newOTPHash,
        otpExpiresAt: newOTPExpiresAt,
        updatedAt: now,
      })
      .where(eq(userInvitations.id, parseInt(id)));

    // Send new invitation email
    await sendInvitationEmail({
      email: invitationRecord.email,
      name: invitationRecord.name,
      otp: newOTP,
      role: invitationRecord.role,
    });

    console.log(`🔄 Invitation resent to ${invitationRecord.email}`);

    return res.status(200).json({
      status: 200,
      message: "Invitation resent successfully",
      data: {
        id: invitationRecord.id,
        email: invitationRecord.email,
      },
    });
  } catch (error) {
    console.error("❌ Error resending invitation:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

/**
 * DELETE /api/users/invitations/:id
 * Delete/cancel an invitation
 */
const deleteInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Missing invitation ID",
      });
    }

    // Find invitation
    const invitation = await db
      .select()
      .from(userInvitations)
      .where(eq(userInvitations.id, parseInt(id)))
      .limit(1);

    if (invitation.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Invitation not found",
      });
    }

    // Delete invitation
    await db
      .delete(userInvitations)
      .where(eq(userInvitations.id, parseInt(id)));

    console.log(`🗑️ Invitation ${id} deleted`);

    return res.status(200).json({
      status: 200,
      message: "Invitation deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting invitation:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/users/:id/image
 * Upload user profile image
 */
const uploadUserImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: "No image file provided",
      });
    }

    // In production, upload to cloud storage (AWS S3, etc.)
    const imagePath = `/uploads/users/${id}/${Date.now()}-${req.file.originalname}`;

    return res.status(200).json({
      status: 200,
      message: "Image uploaded successfully",
      data: {
        url: imagePath,
        path: imagePath,
        filename: req.file.originalname,
      },
    });
  } catch (error) {
    console.error("❌ Error uploading user image:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to upload image",
    });
  }
};

/**
 * PATCH /api/users/:id/status
 * Update user status
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields: id, status",
      });
    }

    const validStatuses = ["active", "inactive", "suspended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 400,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const now = getMySQLDateTime();

    // Update user status
    await db
      .update(users)
      .set({
        status: status,
        updatedAt: now,
      })
      .where(eq(users.id, parseInt(id)));

    console.log(`👤 User ${id} status updated to ${status}`);

    return res.status(200).json({
      status: 200,
      message: "User status updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating user status:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/users/bulk-status
 * Update status for multiple users
 */
const bulkUpdateUserStatus = async (req, res) => {
  try {
    const { user_ids, status } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || !status) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields: user_ids (array), status",
      });
    }

    const validStatuses = ["active", "inactive", "suspended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 400,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const now = getMySQLDateTime();

    // Update multiple users
    for (const userId of user_ids) {
      await db
        .update(users)
        .set({
          status: status,
          updatedAt: now,
        })
        .where(eq(users.id, parseInt(userId)));
    }

    console.log(`👥 Bulk status update for ${user_ids.length} users to ${status}`);

    return res.status(200).json({
      status: 200,
      message: `Status updated for ${user_ids.length} users`,
    });
  } catch (error) {
    console.error("❌ Error bulk updating user status:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

/**
 * GET /api/users/statistics/overview
 * Get user statistics
 */
const getUserStatistics = async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    const allInvitations = await db.select().from(userInvitations);

    const pendingInvitations = allInvitations.filter((inv) => inv.status === "pending").length;
    const acceptedInvitations = allInvitations.filter((inv) => inv.status === "accepted").length;
    const activeUsers = allUsers.filter((u) => u.status === "active").length;
    const inactiveUsers = allUsers.filter((u) => u.status === "inactive").length;

    console.log("📊 User statistics fetched");

    return res.status(200).json({
      status: 200,
      message: "Statistics fetched successfully",
      data: {
        totalUsers: allUsers.length,
        activeUsers,
        inactiveUsers,
        totalInvitations: allInvitations.length,
        pendingInvitations,
        acceptedInvitations,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching user statistics:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

module.exports = {
  inviteUser,
  uploadInviteImage,
  acceptInvitation,
  getInvitationsList,
  resendInvitation,
  deleteInvitation,
  uploadUserImage,
  updateUserStatus,
  bulkUpdateUserStatus,
  getUserStatistics,
};
