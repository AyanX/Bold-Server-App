const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const axios = require("axios");


const getMySQLDateTime = (date = new Date()) => {
  return date.toISOString().replace("T", " ").slice(0, 19);
};

const uploadImageHelper = (req, res) => {
try {
    //if user not authenticated
  if (!req.user) {
    throw new Error("Unauthorized");
  }

  if(!req.file){
    throw new Error("No image to update profile");
  }
  // Build relative path from uploaded file
  const relativePath = `users/${req.file.filename}`;

  // Return path and public URL
  const baseUrl = process.env.APP_URL || "http://localhost:8000";
  const publicUrl = `${baseUrl}/storage/${relativePath}`;



  return {
    path: relativePath,
    url: publicUrl,
  };
} catch (error) {
  console.error("Error uploading profile image:", error.message);
  throw error;
}
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

    // if (isLocalhost(ip)) {
    //   //generate a random IP for localhost requests
    //   const randomIp = Array.from({ length: 4 }, () =>
    //     Math.floor(Math.random() * 256),
    //   ).join(".");
    //   return randomIp;
    // }

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

const capitalizeFirstLetter = (data) => {
  const capitalize = (str) =>
    str.replace(/(^|\s)\S/g, (char) => char.toUpperCase());

  if (Array.isArray(data)) {
    return data
      .map((item) => capitalize(item.trim().toLowerCase()))
      .join(", ");
  } else {
    return capitalize(data.trim().toLowerCase());
  }
};


async function fetchImageBuffer(imageInput) {
  // Base64 image
  if (typeof imageInput === "string" && imageInput.startsWith("data:image")) {
    const base64Data = imageInput.replace(/^data:image\/\w+;base64,/, "");
    return Buffer.from(base64Data, "base64");
  }

  // URL image (http or https)
  if (typeof imageInput === "string" && /^https?:\/\//.test(imageInput)) {
    const response = await axios.get(imageInput, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0", // Some servers reject default Node UA
        Accept: "image/*",
      },
      maxRedirects: 5,   // Handle redirects (common for Unsplash)
      timeout: 20000,    // 20 seconds timeout
    });
    return Buffer.from(response.data);
  }

  throw new Error("Unsupported image format");
}

// blur image and save it

async function blurBase64Image(imageInput, blurName) {
  try {
    const buffer = await fetchImageBuffer(imageInput);
    const date = Date.now();
    const imgName = blurName || `blurred-${date}`;

    // Absolute path → public/storage/blurred-images
    const outputDir = path.join(process.cwd(), "public", "storage", "blurred-images");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `${imgName}.webp`);

    // Blur & save
    await sharp(buffer)
      .resize(800)
      .blur(10)
      .webp({ quality: 70 })
      .toFile(outputPath);

    const relativePath = `storage/blurred-images/${imgName}.webp`;
    const blurUrl = `${process.env.APP_URL || "http://localhost:8000"}/${relativePath}`;

    return blurUrl;
  } catch (error) {
    console.error("Error processing image: ",blurName, "--------************-------" , error.message);
    throw error;
  }
}

// save image to storage


async function saveBase64Image(imageInput, imageName) {
  try {
    const buffer = await fetchImageBuffer(imageInput);

    const date = Date.now();
    const imgName = imageName || `image-${date}`;

    // Absolute path → public/storage/articles
    const outputDir = path.join(process.cwd(), "public", "storage", "articles");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `${imgName}.webp`);

    // Save & normalize image
    await sharp(buffer).resize(1000).webp({ quality: 85 }).toFile(outputPath);

    // Public URL
    const relativePath = `storage/articles/${imgName}.webp`;
    const url = `${process.env.APP_URL || "http://localhost:8000"}/${relativePath}`;

    return url;
  } catch (error) {
    console.error("Error saving image:", error.message);
    throw error;
  }
}


module.exports = {
  safeUser,
  getMySQLDateTime,
  saveBase64Image,
  uploadImageHelper,
  blurBase64Image,
  getUser,
  getClientIp,
  createSlug,
  capitalizeFirstLetter,
};
