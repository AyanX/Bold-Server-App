//attach req user from cookie token
const {
  verifyToken,
  verifyRefreshToken,
  generateToken,
} = require("../../utils/jwt/jwt");
const { TokenExpiredError } = require("jsonwebtoken");
const { refreshTokens, users } = require("../../drizzle/schema");
const db = require("../../db/db");
const { eq } = require("drizzle-orm");
const { comparePassword } = require("../bcrypt/bcrypt");

const HandleRefresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    req.user = {
      id: null,
      email: null,
      name: null,
      role: null,
      image: null,
    };
    // No user if no refresh token
    return next(); // No refresh token, proceed without user
  }

  try {
    const refreshPayload = verifyRefreshToken(refreshToken);
    //returns id and email from refresh token payload

    const { id, email } = refreshPayload;
    console.log("Refresh token for user ID:", id, "email:", email);

    // Check DB
    const stored = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, Number(id)))
      .limit(1);

    if (!stored[0]) {
      return res.status(403).json({ message: "Refresh revoked" });
    }

    const isTokenValid = await comparePassword(
      refreshToken,
      stored[0].tokenHash,
    );

    if (!isTokenValid) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const storedUserId = stored[0].userId;

    const userInDb = await db
      .select()
      .from(users)
      .where(eq(users.id, storedUserId))
      .limit(1);


   

    if (userInDb.length === 0) {
      return res.status(403).json({ message: "An error occured with the token" });
    }

    // Create new access token
    const newAccessToken = generateToken({
      id: userInDb[0].id,
      email: userInDb[0].email,
      name: userInDb[0].name,
      role: userInDb[0].role,
      image: userInDb[0].image,
    });

    // Set cookie immediately
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    // Attach user & continue
    req.user = {
      id: userInDb[0].id,
      email: userInDb[0].email,
      name: userInDb[0].name,
      role: userInDb[0].role,
      image: userInDb[0].image,
    };
    next();
  } catch (err) {
    console.log("Invalid refresh token", err);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

const cookieParserMiddleware = async (req, res, next) => {
  const accessToken = req.cookies?.token;

  if(!accessToken && !req.cookies?.refreshToken) {
    req.user = {
        id: null,
        email: null,
        name: null,
        role: null,
        image: null,
      };
      return next(); // No access token, proceed without user
  }

  try {
    // Try access token first
    const payload = verifyToken(accessToken);
    req.user = payload;
    return next();
  } catch (err) {
    // Only handle expiration errors here, other errors should fail immediately
    if (!(err instanceof TokenExpiredError)) {
      HandleRefresh(req, res, next);
    } else {
      return res.status(401).json({ message: "Invalid access token" });
    }
  }
};

module.exports = cookieParserMiddleware;
