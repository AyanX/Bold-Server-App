const {
  articles,
  users,
  categories: categoriesDb,
} = require("../../drizzle/schema");
const db = require("../../db/db");
const { eq, sql, and } = require("drizzle-orm");

const {
  createSlug,
  capitalizeFirstLetter,
  blurBase64Image,
} = require("../utils");

//create an array of all category slugs

function mapArticle(article) {
  const allCategories = JSON.parse(article.categories || "[]");

  return {
    id: String(article.id),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    image: article.image,
    category: article.category,
    categories: allCategories,
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
  if (!req.user.id) {
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

    // to do :::: attach the slug of the category to the categories field , .... frontend filtering logics...

    // Update category article counts for existing categories

    for (const cat of categoriesValue) {
      await db
        .update(categoriesDb)
        .set({
          articleCount: sql`${categoriesDb.articleCount} + 1`,
        })
        .where(sql`LOWER(${categoriesDb.name}) = ${cat.toLowerCase()}`);
    }

    //find the image of the author and attach it to the article
    const authorUser = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user?.id))
      .limit(1);

    // Create an img blur from the base 64 sent as img in the background

    blurBase64Image(image, `blur-${slug}`)
      .then((blurredPath) => {
        console.log(blurredPath)

        db.update(articles)
          .set({ blur_image:blurredPath})
          .where(eq(articles.slug, slug))
          .catch((err) => console.error("Failed to update blur image:", err));
      })
      .catch((err) => console.error("Blur generation failed", err));

    //if categories or tags are arrays, turn them into json objects
    await db.insert(articles).values({
      categories: JSON.stringify(categoriesValue),
      title,
      slug,
      excerpt,
      author_id: Number(req.user.id),
      category,
      image,
      author: author
        ? capitalizeFirstLetter(author)
        : capitalizeFirstLetter(req.user.name),
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

    //

    // Update user article counts

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
      .where(eq(users.id, req.user?.id));

    // resend latest article added

    const latestArticle = await db
      .select()
      .from(articles)
      .orderBy(sql`${articles.created_at} DESC`)
      .limit(1);

    const dbArticle = latestArticle[0];

    const mappedArticle = mapArticle(dbArticle);
    return res.status(201).json({
      data: mappedArticle,
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
  if (!req.user.id) {
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

    const articleAuthor = existingArticle[0].author;

    // Check if the requesting user is the author of the article or has admin privileges
    if (
      articleAuthor.toLowerCase() !== req.user.name.toLowerCase() &&
      req.user.role.toLowerCase() !== "admin"
    ) {
      // incase a user changed name, check by author_id in articles  as well req.user.id
      if (existingArticle[0].author_id !== Number(req.user.id)) {
        console.log(
          "Forbidden: User is not the author or admin",
          req.user.role,
          req.user.id,
        );
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    // update categories counts if categories have changed
    const oldCategories = JSON.parse(existingArticle[0].categories || "[]");

    // Update category article counts for existing categories, decrement old categories

    for (const cat of oldCategories) {
      await db
        .update(categoriesDb)
        .set({
          articleCount: sql`GREATEST(${categoriesDb.articleCount} - 1, 0)`,
        })
        .where(sql`LOWER(${categoriesDb.name}) = ${cat.toLowerCase()}`);
    }
    // Update category article counts for new categories, increment new categories

    for (const cat of categoriesValue) {
      await db
        .update(categoriesDb)
        .set({
          articleCount: sql`${categoriesDb.articleCount} + 1`,
        })
        .where(sql`LOWER(${categoriesDb.name}) = ${cat.toLowerCase()}`);
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
    const userAuthor = await db
      .select()
      .from(users)
      .where(eq(users.id, existingArticle[0].author_id));

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
      .where(eq(users.id, existingArticle[0].author_id));

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

  if (!req.user.email || !req.user.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    //find the user first who sent the request
    let userAuthor = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id));

    if (userAuthor.length === 0) {
      return res.status(404).json({ error: "Author user not found" });
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

    // author of the existing article

    const articleAuthor = existingArticle[0].author;

    // Check if the requesting user is the author of the article or has admin privileges
    if (
      articleAuthor.toLowerCase() !== req.user.name.toLowerCase() &&
      req.user.role.toLowerCase() !== "admin"
    ) {
      if (existingArticle[0].author_id !== Number(req.user.id)) {
        console.log(
          "Forbidden: User is not the author or admin",
          req.user.role,
          req.user.id,
        );
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    //update category counts for the article categories
    const articleCategories = JSON.parse(existingArticle[0].categories || "[]");

    for (const cat of articleCategories) {
      await db
        .update(categoriesDb)
        .set({
          articleCount: sql`GREATEST(${categoriesDb.articleCount} - 1, 0)`,
        })
        .where(sql`LOWER(${categoriesDb.name}) = ${cat.toLowerCase()}`);
    }

    // Update user article counts
    const total = userAuthor[0].total_articles;
    let published = userAuthor[0].articles_published;

    // Assuming we need to check if the deleted article was published

    if (existingArticle.length && existingArticle[0].status === "Published") {
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
      .where(eq(users.id, existingArticle[0].author_id));

    //delete the article

    await db.delete(articles).where(eq(articles.id, Number(id)));

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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

    const viewedArticle = existingArticle[0];

    const viewedArticleCategories = JSON.parse(
      viewedArticle.categories || "[]",
    );

    //update category views count for categories

    for (const cat of viewedArticleCategories) {
      await db
        .update(categoriesDb)
        .set({
          views: sql`${categoriesDb.views} + 1`,
        })
        .where(sql`LOWER(${categoriesDb.name}) = ${cat.toLowerCase()}`);
    }

    //update views count for article
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
