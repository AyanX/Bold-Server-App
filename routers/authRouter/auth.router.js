const express = require("express");
const { status } = require("express/lib/response");
const { login, signup,logout } = require("../../controllers/authController/auth.controller");
const authRouter = express.Router();

// Auth routes
authRouter.post("/api/signup", signup);
authRouter.post("/api/login", login);

authRouter.post("/api/logout",logout);

// Auth route
authRouter.get("/api/user", (req, res) => {
  res.json({ message: "api working" });
});

module.exports = authRouter;
