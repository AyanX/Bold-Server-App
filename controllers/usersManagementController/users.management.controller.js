const { userInvitations, users } = require("../../drizzle/schema");
const db = require("../../db/db");
const { eq, and, sql } = require("drizzle-orm");
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
const sendMail = require("../../mailer/nodemailer.config");

const inviteUser = async (req, res) => {
  const { name: invitor, role } = req.user;

  if (!invitor || !role) {
    return res
      .status(403)
      .json({ message: "forbidden. Login to create a user" });
  }

  // if user is not admin or manager return forbidden
  if (role.toLowerCase() !== "admin") {
    return res
      .status(403)
      .json({ message: "forbidden. Only Admins  can create users" });
  }

  try {
    const { name, email, role, department, phone, bio, image } = req.body;

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

    // if user with the email already has an invitation and it is still active return conflict
    // status can be "suspended" or pending, if the invitation was suspended by admin, in that case we should allow to create a new invitation
    if (existingInvite.length > 0 && existingInvite[0].status === "accepted") {
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

    //send email with OTP
    try {
      const mailOptions = {
        to: email,
        subject: "You're Invited to Join Our Platform!",
        text: `Hello ${name},\n\nYou have been invited to join our platform as 
        a ${role} in the ${department} department. Please use the following
         OTP code to accept the invitation and create your account:\n\nOTP Code: ${otp}\n\nThis code will 
         expire in 24 hours.\n
         
         Visit http://localhost:3000/#/accept-invitation to accept the invitation and set up your account.\n\nIf you have any questions, feel free to reach out to us. \n
         
         \nBest regards,\n${invitor}`,
      };

      console.log(`Sending invitation email to ${email}:`);
      await sendMail(mailOptions);
    } catch (error) {
      console.error(`Failed to send invitation email to ${email}:`, error);
      return res.status(500).json({
        status: 500,
        message: "Failed to send invitation email",
      });
    }


  


    // Create invitation record in database
    await db.transaction(async (tx) => {

      // Insert pending user
    if(existingInvite.length > 0 && (existingInvite[0]?.status.toLowerCase() === "suspended" || existingInvite[0]?.status.toLowerCase() === "pending")){
        const dataToUpdate = {}
        if(name) dataToUpdate.name = name.trim();
        if(role) dataToUpdate.role = role;
        if(department) dataToUpdate.department = department;
        if(phone) dataToUpdate.phone = phone;
        if(bio) dataToUpdate.bio = bio;
        if(image) dataToUpdate.image = image;
        dataToUpdate.updatedAt = now;
        dataToUpdate.status = "Pending";

        await tx.update(users)
        .set(dataToUpdate)
        .where(
          and(
            eq(users.email, email.toLowerCase().trim()),
            eq(users.status, "Suspended"),
          )
        );
    }else{
        await tx.insert(users).values({
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
        invited_by: `${invitor} || ${role}`,
        invited_via: "invitation",
      });
    }


       // query the inserted user to get the id
        const [insertedUser] = await tx
        .select().from(users).where(
          and(
            eq(users.email, email.toLowerCase().trim()),
            eq(users.status, "Pending"),
          )
        ).limit(1);

        if (!insertedUser) {
          console.error(`Failed to retrieve inserted user for email ${email}`);
          throw new Error("Failed to create user");
        }

       const userId = insertedUser.id;

      // if invitation was suspended, we should update the existing record instead of creating a new one
      if (
        (existingInvite.length > 0 &&
          existingInvite[0]?.status === "suspended") ||
        existingInvite[0]?.status === "pending"
      ) {
        await tx
          .update(userInvitations)
          .set({
            name: name.trim(),
            role: role || "Contributor",
            department: department || null,
            phone: phone || null,
            bio: bio || "No bio available.",
            otpHash: otpHash,
            otpExpiresAt: otpExpiresAt,
            invitedBy: `${invitor} || ${role}`,
            image: image || null,
            status: "pending",
            updatedAt: now,
          })
          .where(eq(userInvitations.userId, userId));
      } else if (
        existingInvite.length > 0 &&
        existingInvite[0]?.status === "accepted"
      ) {
        console.log(`User with email ${email} already accepted an invitation`);
        return res.status(409).json({
          status: 409,
          message: "User with this email has already been invited",
        });
      } else {
        //create new invitation
        // Insert invitation
        await tx.insert(userInvitations).values({
          name: name.trim(),
          userId: userId,
          email: email.toLowerCase().trim(),
          role: role || "Contributor",
          department: department || null,
          phone: phone || null,
          bio: bio || "No bio available.",
          status: "pending",
          otpHash: otpHash,
          otpExpiresAt: otpExpiresAt,
          invitedBy: `${invitor} || ${role}`,
          image: image || null,
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    // Send invitation email
    return res.status(201).json({
      status: 201,
      message: "Invitation sent successfully",
      data: {
        email,
        name,
        role,
        image,
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

const uploadInviteImage = async (req, res) => {
  try {
    // Build relative path from uploaded file
    const { path: relativePath, url: publicUrl } = uploadImageHelper(req, res);

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

const acceptInvitation = async (req, res) => {
  // "email":"xhadyayan@gmail.com",
  // "otp":"888569",
  // "password":"robotic123"
  // linkedin
  //phoneNumber

  try {
    const { email, otp, password, linkedin, phoneNumber } = req.body;

    // Validation
    if (!email || !otp || !password) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields: email, otp, password, name",
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

    // update the user record in users table and mark invitation as accepted in user_invitations table in a transaction
    await db.transaction(async (tx) => {
      //  Update the user
      await tx
        .update(users)
        .set({
          password: hashedPassword,
          status: "Inactive",
          updated_at: now,
          invitation_accepted_at: now,
          email_verified_at: now,
          linkedin: linkedin || null,
          phone_number: phoneNumber || null,
        })
        .where(
          and(
            eq(users.email, email.toLowerCase().trim()),
            eq(users.status, "Pending"),
          ),
        );

      // Update the invitation
      await tx
        .update(userInvitations)
        .set({
          status: "accepted",
          updatedAt: now,
        })
        .where(eq(userInvitations.userId, invitationRecord.userId));
    });
    console.log(`User ${email} accepted invitation and created account`);

    return res.status(201).json({
      status: 201,
      message: "Account created successfully",
      data: {
        email,
        role: invitationRecord.role,
        status: 201,
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

const uploadUserImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: "No image file provided",
      });
    }
    // Build relative path from uploaded file
    const { path: imagePath, url: publicUrl } = uploadImageHelper(req, res);

    // Update user's image path in database
    await db
      .update(users)
      .set({
        image: publicUrl,
        updated_at: getMySQLDateTime(),
      })
      .where(eq(users.id, Number(id)));

    return res.status(200).json({
      status: 200,
      message: "Image uploaded successfully",
      data: {
        url: publicUrl,
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

module.exports = {
  inviteUser,
  uploadInviteImage,
  acceptInvitation,
  uploadUserImage,
};
