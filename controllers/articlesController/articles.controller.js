const { articles, users } = require("../../drizzle/schema");
const db = require("../../db/db");
const { eq, sql, and } = require("drizzle-orm");

const { createSlug } = require("../utils");

function mapArticle(article) {
  return {
    id: String(article.id),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    image: article.image,
    category: article.category,
    categories: JSON.parse(article.categories || "[]"),
    author: article.author ?? "",
    date: article.created_at,
    readTime: article.read_time ?? "5 min read",
    isPrime: Boolean(article.is_prime),
    isHeadline: Boolean(article.is_headline),
    status: article.status ?? "Draft",
    metaTags: JSON.parse(article.meta_tags || "[]"),
    metaDescription: article.meta_description ?? "",
    seoScore: article.seo_score ?? 0,
    views: article.views ?? 0,
    clicks: article.clicks ?? 0,
    content: article.content ?? "",
    created_at: article.created_at,
    updated_at: article.updated_at,
    authorImage: article.author_image || null,
  };
}

const getAllArticles = async (req, res) => {
  try {
    const allArticles = await db.select().from(articles);

    const mappedArticles = allArticles.map((article) => mapArticle(article));

    return res.status(200).json({
      data: mappedArticles,
      status: 200,
      message: "Articles fetched successfully",
    });
  } catch (err) {
    console.log("Error fetching articles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addNewArticle = async (req, res) => {
  if (!req.user.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    categories,
    title,
    slug,
    excerpt,
    category,
    image,
    author,
    read_time,
    is_prime,
    status,
    content,
    is_headline,
    seo_score,
  } = req.body;

  try {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    // Validate and format categories (MySQL SET requires array or comma-separated string)
    let categoriesValue = [];
    if (categories && Array.isArray(categories)) {
      categoriesValue = categories;
    }

    //find the image of the author and attach it to the article

    const authorUser = await db
      .select()
      .from(users)
      .where(eq(users.email, req.user.email))
      .limit(1);

    //if categories or tags are arrays, turn them into json objects
    await db.insert(articles).values({
      categories: JSON.stringify(categoriesValue),
      title,
      slug,
      excerpt,
      category,
      image,
      author,
      read_time,
      is_prime,
      status: status || "Published",
      content,
      is_headline,
      seo_score,
      created_at: now,
      updated_at: now,
      author_image: authorUser.length ? authorUser[0].image : null,
    });

    // Update user article counts
    if (req.user && req.user.email) {
      await db
        .update(users)
        .set({
          total_articles: sql`${users.total_articles} + 1`,
          articles_published:
            (status || "Published") === "Published"
              ? sql`${users.articles_published} + 1`
              : sql`${users.articles_published}`,
          //draft articles
          articles_drafted:
            status === "Draft"
              ? sql`${users.articles_drafted} + 1`
              : sql`${users.articles_drafted}`,
          //pending articles
          articles_pending:
            status === "Pending"
              ? sql`${users.articles_pending} + 1`
              : sql`${users.articles_pending}`,
        })
        .where(eq(users.email, req.user.email));
    }

    latestArticle = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, slug))
      .limit(1);

    latestArticle = latestArticle[0];
    return res.status(201).json({
      data: latestArticle,
      message: "Article added successfully",
      status: 201,
    });
  } catch (error) {
    console.error("Error adding article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getArticleByIdOrSlug = async (req, res) => {
  try {
    const { identifier } = req.params;

    //the identifier can be either id or slug

    let article;
    if (isNaN(identifier)) {
      // It's a slug title,  check it vs slug titles

      article = await db
        .select()
        .from(articles)
        .where(eq(createSlug(articles.title), identifier))
        .limit(1);
    } else {
      // It's an ID
      article = await db
        .select()
        .from(articles)
        .where(eq(articles.id, Number(identifier)))
        .limit(1);
    }

    if (!article.length) {
      return res.status(404).json({ error: "Article not found" });
    }

    const dbArticle = article[0];

    const mappedArticle = mapArticle(dbArticle);

    res.status(200).json({ data: mappedArticle, status: 200 });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateArticleById = async (req, res) => {
  const { id } = req.params;

  //validate user exists
  if (!req.user.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    categories,
    title,
    slug,
    excerpt,
    category,
    image,
    author,
    read_time,
    is_prime,
    status,
    content,
    is_headline,
    seo_score,
  } = req.body;

  try {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    // Validate and format categories
    let categoriesValue = [];
    if (categories && Array.isArray(categories)) {
      categoriesValue = categories;
    }

    // Check if article exists
    const existingArticle = await db
      .select()
      .from(articles)
      .where(eq(articles.id, Number(id)))
      .limit(1);

    if (!existingArticle.length) {
      return res.status(404).json({ error: "Article not found" });
    }

    // Update the article
    await db
      .update(articles)
      .set({
        categories: JSON.stringify(categoriesValue),
        title,
        slug,
        excerpt,
        category,
        image,
        author,
        read_time,
        is_prime,
        status: status || "Published",
        content,
        is_headline,
        seo_score,
        updated_at: now,
      })
      .where(eq(articles.id, Number(id)));

    // Fetch the updated article
    const updatedArticle = await db
      .select()
      .from(articles)
      .where(eq(articles.id, Number(id)))
      .limit(1);

    const dbArticle = updatedArticle[0];

    // Map the article function

    const mappedArticle = mapArticle(dbArticle);

    // Update user article counts
    if (req.user && req.user.email) {
      const userAuthor = await db
        .select()
        .from(users)
        .where(eq(users.email, req.user.email));
      const total = userAuthor[0].total_articles;
      let published = userAuthor[0].articles_published;
      let drafted = userAuthor[0].articles_drafted;
      let pending = userAuthor[0].articles_pending;

      const oldStatus = existingArticle[0].status;
      const newStatus = status || "Published";

      // Decrement the old status count
      if (oldStatus === "Published" && published > 0) {
        published -= 1;
      } else if (oldStatus === "Draft" && drafted > 0) {
        drafted -= 1;
      } else if (oldStatus === "Pending" && pending > 0) {
        pending -= 1;
      }

      // Increment the new status count
      if (newStatus === "Published") {
        published += 1;
      } else if (newStatus === "Draft") {
        drafted += 1;
      } else if (newStatus === "Pending") {
        pending += 1;
      }

      await db
        .update(users)
        .set({
          total_articles: total,
          articles_published: published,
          articles_drafted: drafted,
          articles_pending: pending,
        })
        .where(eq(users.email, req.user.email));
    }

    return res.status(200).json({
      data: mappedArticle,
      message: "Article updated successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getArticlesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const categoryArticles = await db
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.status, "Published"),
          sql`LOWER(${articles.category}) = ${category.toLowerCase()}`,
        ),
      );

    const mappedArticles = categoryArticles.map((article) =>
      mapArticle(article),
    );

    return res.status(200).json({
      data: mappedArticles,
      status: 200,
      message: `Articles for category ${category} fetched successfully`,
    });
  } catch (err) {
    console.log("Error fetching articles by category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteArticleById = async (req, res) => {
  const { id } = req.params;

  if (!req.user.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await db
    .delete(articles)
    .where(eq(articles.id, Number(id)))
    .then(async (result) => {
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Article not found" });
      }

      // Update user article counts
      if (req.user && req.user.email) {
        const userAuthor = await db
          .select()
          .from(users)
          .where(eq(users.email, req.user.email));
        const total = userAuthor[0].total_articles;
        let published = userAuthor[0].articles_published;

        // Assuming we need to check if the deleted article was published
        const deletedArticle = await db
          .select()
          .from(articles)
          .where(eq(articles.id, Number(id)))
          .limit(1);

        if (deletedArticle.length && deletedArticle[0].status === "Published") {
          if (published > 0) {
            published -= 1;
          } else {
            published = 0;
          }
        }
        //update user counts for articles
        await db
          .update(users)
          .set({
            total_articles: total > 0 ? total - 1 : 0,
            articles_published: published,
          })
          .where(eq(users.email, req.user.email));
      }

      res.status(200).json({ message: "Article deleted successfully" });
    })
    .catch((error) => {
      console.error("Error deleting article:", error);
      res.status(500).json({ error: "Internal server error" });
    });
};

const trackView = async (req, res) => {
  const { id } = req.params;
  try {
    const existingArticle = await db
      .select()
      .from(articles)
      .where(eq(articles.id, Number(id)))
      .limit(1);

    if (!existingArticle.length) {
      return res.status(404).json({ error: "Article not found" });
    }

    await db
      .update(articles)
      .set({ views: sql`${articles.views} + 1` })
      .where(eq(articles.id, Number(id)));

    res.status(200).json({ message: "View tracked successfully" });
  } catch (error) {
    console.error("Error tracking view:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const trackClick = async (req, res) => {
  const { id } = req.params;
  try {
    const existingArticle = await db
      .select()
      .from(articles)
      .where(eq(articles.id, Number(id)))
      .limit(1);

    if (!existingArticle.length) {
      return res.status(404).json({ error: "Article not found" });
    }

    await db
      .update(articles)
      .set({ clicks: sql`${articles.clicks} + 1` })
      .where(eq(articles.id, Number(id)));

    res.status(200).json({ message: "Click tracked successfully" });
  } catch (error) {
    console.error("Error tracking click:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addNewArticle,
  getAllArticles,
  getArticleByIdOrSlug,
  updateArticleById,
  deleteArticleById,
  getArticlesByCategory,
  trackView,
  trackClick,
};
