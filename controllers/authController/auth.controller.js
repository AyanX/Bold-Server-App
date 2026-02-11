const bcrypt = require("bcrypt");
const { eq } = require("drizzle-orm");
const db = require("../../db/db");
const { users, refreshTokens } = require("../../drizzle/schema");
const { generateToken, generateRefreshToken } = require("../../utils/jwt/jwt");
const { getClientIp } = require("request-ip");
const { safeUser } = require("../utils");
const { getMySQLDateTime } = require("../utils");

const { hashPassword, comparePassword } = require("../../utils/bcrypt/bcrypt");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // if user not found return
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is not suspended or pending
    if (user.status.toLowerCase() === "suspended" || user.status.toLowerCase() === "pending") {
      return res.status(403).json({ message: "Account is not active" });
    }


    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    // return for invalid passwords
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update login info
    const userIp = getClientIp(req);

    //remove sensitive fields before sending user data

    const safeUserData = safeUser(user);
    // Generate JWT token

    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      image: user.image,
    });

    const refreshToken = generateRefreshToken({
      id: Number(user.id),
      email: user.email,
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 1000 * 60 * 25, // 25mins
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

    //insert refreshtoken in db
    // userId ---
    //refresh_token

    //refresh token expires in 7 days
    const now = new Date();

    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 7);

    const createdAt = getMySQLDateTime(now);
    const expiresAtFormatted = getMySQLDateTime(expiresAt);

    const hashedToken = await hashPassword(refreshToken);

    await db.transaction(async (tx) => {
      //delete existing refresh tokens for the user
      try {
        await tx
          .delete(refreshTokens)
          .where(eq(refreshTokens.userId, Number(user.id)));
      } catch (err) {
        console.log("Logging in ", user.name)
      }

      //  Insert refresh token
      await tx.insert(refreshTokens).values({
        userId: Number(user.id),
        tokenHash: hashedToken,
        createdAt,
        expiresAt: expiresAtFormatted,
      });

      // Update user login metadata
      await tx
        .update(users)
        .set({
          last_login_at: getMySQLDateTime(),
          last_login_ip: userIp,
          status: "active",
          login_count: (user.login_count || 0) + 1,
        })
        .where(eq(users.id, user.id));
    });

    return res.status(200).json({
      message: "Login successful",
      status: "ok",
      data: safeUserData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  console.log("Logout request received");
  const { id } = req.user;

  // if a user is not authenticated
  if (!id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = getMySQLDateTime();

  //find the user
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)))
      .limit(1);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //update users last_active
    await db
      .update(users)
      .set({
        last_active: now,
        status: "Inactive",
      })
      .where(eq(users.id, Number(id)));

    // Clear the token cookie
    res
      .clearCookie("token", {
        httpOnly: true,
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
      });

    //clear refresh tokens from db
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, Number(id)));

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { login, logout };
