const express = require("express");
const {
  getAllArticles,
  getArticleByIdOrSlug,
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

articlesRouter.get("/:identifier", getArticleByIdOrSlug);

articlesRouter.put("/:id", updateArticleById);

articlesRouter.delete("/:id", deleteArticleById);


articlesRouter.post("/:id/view", trackView);

articlesRouter.post("/:id/click", trackClick);
module.exports = articlesRouter;


