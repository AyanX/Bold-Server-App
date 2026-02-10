const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../../controllers/usersController.js/users.controller');
const { inviteUser } = require('../../controllers/usersManagementController/users.management.controller');
const AuthCheck = require('../../utils/authCheck/authCheck');

const usersRouter = express.Router();

// GET all users with optional search
usersRouter.get("/", AuthCheck, getAllUsers);

// POST create a new user
// usersRouter.post("/", createUser);

usersRouter.post("/", AuthCheck, inviteUser);

// GET single user by ID
usersRouter.get("/:id", AuthCheck, getUserById);

// PUT update user
usersRouter.put("/:id", AuthCheck, updateUser);

// DELETE user
usersRouter.delete("/:id", AuthCheck, deleteUser);

module.exports = usersRouter;