const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const sendMail = async (options) => {
  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: options.to,
      subject: options.subject,
      text: options.text,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Mail error:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendMail;
