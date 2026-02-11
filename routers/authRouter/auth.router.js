const express = require("express");
const { status } = require("express/lib/response");
const { login, logout } = require("../../controllers/authController/auth.controller");
const AuthCheck = require("../../utils/authCheck/authCheck");
const authRouter = express.Router();

// Auth routes
authRouter.post("/api/login", login);

authRouter.post("/api/logout", AuthCheck, logout);

module.exports = authRouter;
