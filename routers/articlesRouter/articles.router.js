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
const AuthCheck = require("../../utils/authCheck/authCheck");

const articlesRouter = express.Router();

articlesRouter.get("/", getAllArticles);

articlesRouter.post("/", AuthCheck, addNewArticle);

articlesRouter.get("/:identifier", getArticleByIdOrSlug);

articlesRouter.put("/:id", AuthCheck, updateArticleById);

articlesRouter.delete("/:id", AuthCheck, deleteArticleById);


articlesRouter.post("/:id/view", trackView);

articlesRouter.post("/:id/click", trackClick);
module.exports = articlesRouter;


