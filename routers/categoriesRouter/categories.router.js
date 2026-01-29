const express = require('express');
const {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../../controllers/categoriesController/categories.controller');

const categoriesRouter = express.Router();

// GET all categories with optional search
categoriesRouter.get("/", getAllCategories);

// POST create a new category
categoriesRouter.post("/", createCategory);

// GET single category by ID
categoriesRouter.get("/:id", getCategoryById);

// PUT/PATCH update category
categoriesRouter.put("/:id", updateCategory);

// DELETE category
categoriesRouter.delete("/:id", deleteCategory);

module.exports = categoriesRouter;