const express = require("express");
const { status } = require("express/lib/response");
const { login, signup } = require("../../controllers/authController/auth.controller");
const authRouter = express.Router();

// Auth routes
authRouter.post("/api/signup", signup);
authRouter.post("/api/login", login);

authRouter.post("/api/logout", (req, res) => {
  //clear cookies or tokens here
  res.json({ message: "api working" });
});

// Auth route
authRouter.get("/api/user", (req, res) => {
  res.json({ message: "api working" });
});

module.exports = authRouter;
