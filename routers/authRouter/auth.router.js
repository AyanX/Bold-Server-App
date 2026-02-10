const express = require("express");
const { status } = require("express/lib/response");
const { login, logout } = require("../../controllers/authController/auth.controller");
const AuthCheck = require("../../utils/authCheck/authCheck");
const authRouter = express.Router();

// Auth routes
authRouter.post("/api/login", login);

authRouter.post("/api/logout", AuthCheck, logout);

// Auth route
authRouter.get("/api/user", AuthCheck, (req, res) => {
  res.json({ message: "api working" });
});

module.exports = authRouter;
