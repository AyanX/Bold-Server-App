const express = require('express');
const {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../../controllers/categoriesController/categories.controller');
const { getArticlesByCategory } = require('../../controllers/articlesController/articles.controller');
const AuthCheck = require('../../utils/authCheck/authCheck');

const categoriesRouter = express.Router();

// GET all categories with optional search
categoriesRouter.get("/", getAllCategories);

categoriesRouter.get("/:category", getArticlesByCategory);

categoriesRouter.get("/category/:category", getArticlesByCategory);

// POST create a new category
categoriesRouter.post("/", AuthCheck, createCategory);

// GET single category by ID
categoriesRouter.get("/:id", getCategoryById);

// PUT/PATCH update category
categoriesRouter.put("/:id", AuthCheck, updateCategory);

// DELETE category
categoriesRouter.delete("/:id", AuthCheck, deleteCategory);

module.exports = categoriesRouter;