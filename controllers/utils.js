const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const getMySQLDateTime = () => {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
};

const uploadImageHelper = (req, res) => {
  //if user not authenticated
  if (!req.user) {
    throw new Error("Unauthorized");
  }
  // Build relative path from uploaded file
  const relativePath = `users/${req.file.filename}`;

  // Return path and public URL
  const baseUrl = process.env.APP_URL || "http://localhost:8000";
  const publicUrl = `${baseUrl}/storage/${relativePath}`;

  console.log(`Image uploaded successfully: ${req.file.filename}`);

  return {
    path: relativePath,
    url: publicUrl,
  };
};

const sensitiveFields = [
  "password",
  "reset_token",
  "remember_token",
  "reset_token_expiry",
  "two_factor_secret",
  "two_factor_recovery_codes",
  "last_login_ip",
];

//removing sensitive fields from user object
const safeUser = (user) => {
  const safeUserDetails = Object.fromEntries(
    Object.entries(user).filter(([key]) => !sensitiveFields.includes(key)),
  );
  return safeUserDetails;
};

//get user info from request cookie  ,, req.user set by cookie parser middleware
const getUser = (req, res) => {
  if (!req.user || !req.user.email) {
    throw new Error("Unauthorized");
  }

  return {
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    id: req.user.id,
  };
};

const isLocalhost = (ip) =>
  ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1";

const getClientIp = (req) => {
  try {
    const ip = req.clientIp;

    if (isLocalhost(ip)) {
      //generate a random IP for localhost requests
      const randomIp = Array.from({ length: 4 }, () =>
        Math.floor(Math.random() * 256),
      ).join(".");
      return randomIp;
    }

    return ip;
  } catch (e) {
    throw new Error("Unable to determine client IP");
  }
};

const createSlug = (title) => {
  return (title || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const capitalizeFirstLetter = (string) => {
  const formattedName = string
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return formattedName;
};

async function blurBase64Image(base64Image, blurName) {
  // Remove data:image/...;base64, prefix
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const buffer = Buffer.from(base64Data, "base64");
  const date = Date.now();
  const imgName = blurName || `blurred-${date}`;

  // Build absolute path to public/storage/blurred-images
  const outputDir = path.join(
    process.cwd(), // project root
    "public",
    "storage",
    "blurred-images",
  );

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
  }

  // Final file path
  const outputPath = path.join(outputDir, `${imgName}.webp`);

  // Blur and save image
  await sharp(buffer)
    .resize(800)
    .blur(10)
    .webp({ quality: 70 })
    .toFile(outputPath);

  // Return relative path for database / frontend
  const blurredImgPath = `storage/blurred-images/${imgName}.webp`;

  const blurUrl = `${process.env.APP_URL || "http://localhost:8000"}/${blurredImgPath}`;
  
  return blurUrl;
}

module.exports = {
  safeUser,
  getMySQLDateTime,
  uploadImageHelper,
  blurBase64Image,
  getUser,
  getClientIp,
  createSlug,
  capitalizeFirstLetter,
};
