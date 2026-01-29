const express = require('express');
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} = require('../../controllers/usersController.js/users.controller');

const usersRouter = express.Router();

// GET all users with optional search
usersRouter.get("/", getAllUsers);

// POST create a new user
usersRouter.post("/", createUser);

// GET single user by ID
usersRouter.get("/:id", getUserById);

// PUT update user
usersRouter.put("/:id", updateUser);

// DELETE user
usersRouter.delete("/:id", deleteUser);

module.exports = usersRouter;