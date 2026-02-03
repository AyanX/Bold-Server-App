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
    const ip = req.clientIp

    // if (isLocalhost(ip)) {
    //   //generate a random IP for localhost requests
    //    const randomIp = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join(".");
    //   return randomIp;
    // }

    return ip;
  } catch (e) {
    throw new Error("Unable to determine client IP");
  }
};


const createSlug = (title) => {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

module.exports = {
  safeUser,
  getMySQLDateTime,
  uploadImageHelper,
  sensitiveFields,
  getUser,
  getClientIp,
  createSlug,
};
