const bcrypt = require("bcrypt");
const { eq } = require("drizzle-orm");
const db = require("../../db/db");
const { users } = require("../../drizzle/schema");
const { generateToken } = require("../../utils/jwt/jwt");

const isoDate = require("../../controllers/utils").getMySQLDateTime();

const fakeLogin = async (req, res) => {
        const token = generateToken({
      id: 5,
      role: "Admin",
      email: "xhadyayan@gmail.com",
      name: "xyz",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax", // Same-origin now
      secure: false, // localhost
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

return res.json({
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "Admin",
    "status": "Active",
    "department": "Engineering",
    "phone": "+254712345678",
    "bio": "Sample bio",
    "image": "https://cdn.example.com/storage/users/user_1674816600_abc12345.jpg",
    "linkedin": "linkedin.com/in/johndoe",
    "last_login_at": "2026-01-26T10:30:00Z",
    "last_login_ip": "192.168.1.1",
    "login_count": 5,
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "message": "Login successful",
  "status": 200
}); 
}

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const now = new Date().toISOString();
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        created_at: now,
        updated_at: now,
      })
      .returning();

    // Return user data without password
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    };

    return res.status(201).json({
      message: "User created successfully",
      status: "ok",
      data: userData,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {

  // fakeLogin(req,res);
  // return;

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

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is active
    if (user.status !== "Active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update login info
    const now = new Date().toISOString();
    await db
      .update(users)
      .set({
        last_login_at: isoDate,
        last_login_ip: req.ip || req.connection.remoteAddress,
        login_count: (user.login_count || 0) + 1,
      })
      .where(eq(users.id, user.id));

    // Return user data without password
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
      image: user.image,
      phone: user.phone,
      bio: user.bio,
      linkedin: user.linkedin,
      last_login_at: user.last_login_at,
      last_login_ip: user.last_login_ip,
      login_count: user.login_count,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax", // Same-origin now
      secure: false, // localhost
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(200).json({
      message: "Login successful",
      status: "ok",
      data: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { login, signup };
