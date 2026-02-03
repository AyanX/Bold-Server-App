const { userInvitations, users } = require("../../drizzle/schema");
const db = require("../../db/db");
const { eq, and } = require("drizzle-orm");
const { hashPassword, comparePassword } = require("../../utils/bcrypt/bcrypt");
const {
  generateOTP,
  generateInvitationToken,
  hashOTP,
  getMySQLDateTime,
  getOTPExpirationTime,
  isValidEmail,
  validatePassword,
  sendInvitationEmail,
} = require("./utils.users.management.controller");
const { uploadImageHelper } = require("../utils");

/**
 * POST /api/users/invite
 * Create a new user invitation with OTP
 */
const inviteUser = async (req, res) => {
  const { name:invitor = "Ayan", role="Admin" } = req.user;

  if (!invitor || !role) {
    return res
      .status(403)
      .json({ message: "forbidden. Login to create a user" });
  }

  try {
    const { name, email, role, department, phone, bio, image } = req.body;

    console.log("adding a new user ", req.body);
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
      otpHash: otpHash,
      otpExpiresAt: otpExpiresAt,
      invitedBy: `${invitor} ||  ${role}`,
      image: image || null,
      createdAt: now,
      updatedAt: now,
    });

    //create a pending user record in users table
    await db.insert(users).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role || "Contributor",
      department: department || null,
      phone: phone || null,
      bio: bio || null,
      status: "Pending",
      created_at: now,
      updated_at: now,
      image: image || null,
      invited_by: `${invitor} ||  ${role}`,
      invited_via:"invitation"
    });

    console.log(`Invitation created for ${email} with OTP: ${otp}`);
    // Send invitation email
    await sendInvitationEmail({
      email,
      name,
      otp,
      role,
      inviterName: invitor,
      department: department || "N/A",
    });

    console.log(`User invitation created for ${email}`);

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
    console.error("Error creating invitation:", error);
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

    // Build relative path from uploaded file
      const { path: relativePath, url: publicUrl } = uploadImageHelper(req,res);

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


  //   {
  // "email":"xhadyayan@gmail.com",
  // "otp":"888569",
  // "confirmPassword":"robotic123",
  // "password":"robotic123"}


  try {
    const { email, otp, password, confirmPassword } = req.body;

    // Validation
    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields: email, otp, password, name",
      });
    }

    //
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Passwords do not match",
      });
    }

    // Find invitation if it exists
    const invitation = await db
      .select()
      .from(userInvitations)
      .where(eq(userInvitations.email, email.toLowerCase().trim()))
      .limit(1);

      // if invitation was not found return
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

    // Check if otp is expired
    if (new Date(invitationRecord.otpExpiresAt) < new Date()) {
      return res.status(410).json({
        status: 410,
        message: "Invitation has expired. Please request a new invitation.",
      });
    }

    // Verify OTP which has been hashed and stored in db
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

    // update the user record in users table

    await db
      .update(users)
      .set({
        password: hashedPassword,
        status: "Inactive",
        updated_at: now,
        invitation_accepted_at: now,
        email_verified_at: now,
      })
      .where(
        and(
          eq(users.email, email.toLowerCase().trim()),
          eq(users.status, "Pending"),
        ),
      );

    // Update invitation status to accepted
    await db
      .update(userInvitations)
      .set({
        status: "accepted",
        updatedAt: now,
      })
      .where(eq(userInvitations.id, invitationRecord.id));

    console.log(`User ${email} accepted invitation and created account`);

    return res.status(201).json({
      status: 201,
      message: "Account created successfully",
      data: {
        email,
        role: invitationRecord.role,
        status: "active",
      },
    });
  } catch (error) {
    console.error(" Error accepting invitation:", error);
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

    console.log(`Fetched ${invitations.length} invitations`);

    return res.status(200).json({
      status: 200,
      message: "Invitations fetched successfully",
      data: invitations,
    });
  } catch (error) {
    console.error(" Error fetching invitations:", error);
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
      department: invitationRecord.department || "N/A",
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

    console.log(
      `👥 Bulk status update for ${user_ids.length} users to ${status}`,
    );

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

    const pendingInvitations = allInvitations.filter(
      (inv) => inv.status === "pending",
    ).length;
    const acceptedInvitations = allInvitations.filter(
      (inv) => inv.status === "accepted",
    ).length;
    const activeUsers = allUsers.filter((u) => u.status === "active").length;
    const inactiveUsers = allUsers.filter(
      (u) => u.status === "inactive",
    ).length;

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
