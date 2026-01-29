const express = require("express");
const { status } = require("express/lib/response");
const authRouter = express.Router();

// Auth routes
authRouter.post("/api/login", (req, res) => {
  //pass and email check logic here

  //    if (response.ok && result.data) {
  //   const userData: User = {
  //     id: result.data.id.toString(),
  //     name: result.data.name,
  //     email: result.data.email,
  //     role: result.data.role,
  //   };
  //   setUser(userData);
  //   setIsLoggedIn(true);
  //   return true;
  // }

  //fake check logic

  // Simulate a successful login

  return res.status(200).json({
    message: "api working",
    status  : "ok",
    data: { id: 1, name: "John Doe", email: "ayan@example.com", role: "admin" },
  });
});

authRouter.post("/api/logout", (req, res) => {
  //clear cookies or tokens here
  res.json({ message: "api working" });
});

// Auth route
authRouter.get("/api/user", (req, res) => {
  res.json({ message: "api working" });
});

module.exports = authRouter;
