const transporter = require("../../mailer/nodemailer.config");
const { hashPassword } = require("../../utils/bcrypt/bcrypt");

const crypto = require("crypto");

const generateOTP = () => {
  return String(Math.floor(Math.random() * 900000) + 100000);
};

const generateInvitationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};


const hashOTP = async (otp) => {
  return await hashPassword(otp);
};


const getMySQLDateTime = () => {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
};


  // Calculate OTP expiration time (24 hours from now)

const getOTPExpirationTime = () => {
  const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return expirationDate.toISOString().replace("T", " ").slice(0, 19);
};

//  * Validate email format

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


//  Validate password strength

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
 * Send invitation email with OTP and instructions to the new user
 */
const sendInvitationEmail = async ({ email, name, otp, role, inviterName = "Admin", department = "N/A" }) => {
  try {
    const mailOptions = {
      from: "The Bold East Africa <noreply@theboldeastafrica.com>",
      to: email,
      subject: "You're Invited to Join The Bold East Africa Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <!-- Gradient Header -->
          <div style="background: linear-gradient(135deg, #007bff, #0056b3); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to The Bold East Africa</h1>
          </div>
          <div style="padding: 20px;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Welcome to The Bold East Africa! You've been invited to join our platform as an <strong>${role}</strong>.</p>
            
            <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Your Invitation Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Role:</strong> ${role}</li>
              <li><strong>Department:</strong> ${department}</li>
            </ul>
            
            <p>To complete your account setup, please use the following One-Time Password (OTP):</p>
            <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center; border: 1px solid #dee2e6;">
              <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code:</p>
              <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 2px;">${otp}</p>
              <p style="margin: 0; color: #666; font-size: 12px;">This code expires in 24 hours. For security, do not share it with anyone.</p>
            </div>
            
            <h3 style="color: #333;">Next Steps:</h3>
            <ol>
              <li>Visit our platform at <a href="https://theboldeastafrica.com/accept-invitation" style="color: #007bff;">https://theboldeastafrica.com/accept-invitation</a></li>
              <li>Enter your email, the OTP above, and create a new password (minimum 8 characters).</li>
              <li>Submit the form to activate your account.</li>
            </ol>
            
            <p>If you have any questions, contact your admin or <a href="mailto:support@theboldeastafrica.com" style="color: #007bff;">support@theboldeastafrica.com</a>.</p>
            
            <p>Best regards,<br>The Bold East Africa Team</p>
          </div>
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd;">
            <p style="margin: 0;">
              <a href="https://theboldeastafrica.com" style="color: #007bff; text-decoration: none;">Visit our website</a> | 
              <a href="mailto:support@theboldeastafrica.com" style="color: #007bff; text-decoration: none;">Contact Support</a>
            </p>
            <p style="margin: 5px 0 0;">&copy; ${new Date().getFullYear()} The Bold East Africa. All rights reserved.</p>
          </div>
        </div>
      `,
    };

  
    await transporter.sendMail(mailOptions);
    console.log(` Invitation email sent to ${email}`);
  } catch (error) {
    console.error(` Failed to send invitation email to ${email}:`, error);
    throw new Error("Failed to send invitation email");
  }
};

module.exports = {
  generateOTP,
  generateInvitationToken,
  hashOTP,
  getMySQLDateTime,
  getOTPExpirationTime,
  isValidEmail,
  validatePassword,
  sendInvitationEmail,
};