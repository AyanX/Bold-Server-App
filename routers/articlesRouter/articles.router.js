const express = require("express");
const {
  getAllArticles,
  getArticleById,
  addNewArticle,
  updateArticleById,
  deleteArticleById,
} = require("../../controllers/articlesController/articles.controller");


const articlesRouter = express.Router();

articlesRouter.get("/", getAllArticles);

articlesRouter.post("/", addNewArticle);

articlesRouter.get("/:id", getArticleById);

articlesRouter.put("/:id", updateArticleById);
articlesRouter.delete("/:id", deleteArticleById);

module.exports = articlesRouter;
