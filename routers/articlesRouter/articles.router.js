const express = require("express");
const {
  getAllArticles,
  getArticleById,
  addNewArticle,
  updateArticleById,
  deleteArticleById,
  getArticlesByCategory,
  trackView,
  trackClick,
} = require("../../controllers/articlesController/articles.controller");


const articlesRouter = express.Router();

articlesRouter.get("/", getAllArticles);

articlesRouter.post("/", addNewArticle);

articlesRouter.get("/:id", getArticleById);

articlesRouter.put("/:id", updateArticleById);

articlesRouter.delete("/:id", deleteArticleById);
articlesRouter.post("/:id/view", trackView);

articlesRouter.post("/:id/click", trackClick);
module.exports = articlesRouter;


