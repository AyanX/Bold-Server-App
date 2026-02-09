const nodemailer = require("nodemailer");

// Create Brevo SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === 465, // true for 465, false for other ports (587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  }
});

// Test the connection (optional - for debugging)
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer SMTP connection error:", error);
  } else {
    console.log("Nodemailer SMTP connection successful");
  }
});

module.exports = transporter;
