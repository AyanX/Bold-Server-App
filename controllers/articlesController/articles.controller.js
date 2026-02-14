const {
  articles,
  users,
  categories: categoriesDb,
} = require("../../drizzle/schema");
const db = require("../../db/db");
const { eq, sql, and, desc } = require("drizzle-orm");
const redis = require("../../utils/redis.client");

const {
  createSlug,
  capitalizeFirstLetter,
  blurBase64Image,
  saveBase64Image,
  getUser,
  getMySQLDateTime,
} = require("../utils");

//create an array of all category slugs

function mapArticle(article) {
  const allCategories = JSON.parse(article.categories || "[]");

  const toUpperCaseFirstLetter = allCategories.map((cat) =>
    capitalizeFirstLetter(cat),
  );
  return {
    id: String(article.id),
    title: String(article.title),
    slug: String(article.slug),
    excerpt: article.excerpt ?? "",
    image: article.image,
    category: article.category,
    categories: Array.isArray(toUpperCaseFirstLetter)
      ? toUpperCaseFirstLetter
      : [toUpperCaseFirstLetter],
    author: article.author ?? "",
    date: article.created_at,
    readTime: article.read_time ?? "5 min read",
    isPrime: Boolean(article.is_prime),
    isHeadline: Boolean(article.is_headline),
    status: article.status ?? "Draft",
    metaTags: JSON.parse(article.meta_tags || "[]"),
    metaDescription: article.meta_description ?? "",
    seoScore: article.seo_score ?? 1,
    views: article.views ?? 0,
    clicks: article.clicks ?? 0,
    content: article.content ?? "",
    created_at: article.created_at,
    updated_at: article.updated_at,
    authorImage: article.author_image || null,
    blur_image: article.blur_image || null,
  };
}

const getAllArticles = async (req, res) => {
  try {
    // check if articles are cached in redis
    const cachedArticles = await redis.get("all_articles");

    if (cachedArticles) {
      const articlesData = JSON.parse(cachedArticles);


      return res.status(200).json({
        data: articlesData,
        status: 200,
        message: "Articles fetched successfully (from cache)",
      });
    }

    const allArticles = await db
      .select()
      .from(articles)
      .orderBy(desc(articles.created_at));

    const mappedArticles = allArticles.map((article) => mapArticle(article));

    // cache the articles in redis with an expiration time of 10 minutes (600 seconds)
    await redis.set("all_articles", JSON.stringify(mappedArticles), "EX", 600);


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
  const { id, name } = getUser(req);

  if (!id) {
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
    const now = getMySQLDateTime();

    // Validate and format categories (MySQL SET requires array or comma-separated string)
    let categoriesValue = [];
    if (categories && Array.isArray(categories)) {
      categoriesValue = categories;
    }

    // to do :::: attach the slug of the category to the categories field , .... frontend filtering logics...

    //find the image of the author and attach it to the article
    const authorUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    // define the latest article which is being added
    const articleToAdd = {
      categories: capitalizeFirstLetter(JSON.stringify(categoriesValue)),
      title,
      slug,
      excerpt,
      author_id: Number(id),
      category: capitalizeFirstLetter(category),
      image,
      author: author
        ? capitalizeFirstLetter(author)
        : capitalizeFirstLetter(name),
      read_time,
      is_prime,
      status: capitalizeFirstLetter(status) || "Published",
      content,
      is_headline,
      seo_score,
      created_at: now,
      updated_at: now,
      author_image: authorUser.length ? authorUser[0].image : null,
    };

    let latestArticle;

    //save image as url
    //if categories or tags are arrays, turn them into json objects
    await db.transaction(async (tx) => {
      // Update category article counts for existing categories

      for (const cat of categoriesValue) {
        //ensure cat is string before calling toLowerCase
        if (typeof cat !== "string") {
          continue;
        }

        await db
          .update(categoriesDb)
          .set({
            articleCount: sql`${categoriesDb.articleCount} + 1`,
          })
          .where(sql`LOWER(${categoriesDb.name}) = ${cat.toLowerCase()}`);
      }
      // insert article
      await tx.insert(articles).values(articleToAdd);

      // update user article counts
      await tx
        .update(users)
        .set({
          total_articles: sql`${users.total_articles} + 1`,
          articles_published:
            (status || "Published") === "Published"
              ? sql`${users.articles_published} + 1`
              : sql`${users.articles_published}`,
          articles_drafted:
            status === "Draft"
              ? sql`${users.articles_drafted} + 1`
              : sql`${users.articles_drafted}`,
          articles_pending:
            status === "Pending"
              ? sql`${users.articles_pending} + 1`
              : sql`${users.articles_pending}`,
        })
        .where(eq(users.id, id));

      // fetch the latest article added to return in response
      latestArticle = await tx
        .select()
        .from(articles)
        .orderBy(desc(articles.id))
        .limit(1);
    });

    // resend latest article added
    if (!latestArticle.length) {
      return res
        .status(500)
        .json({ error: "Failed to retrieve added article" });
    }

    const mappedArticle = mapArticle(latestArticle[0]);

    //return the article added as response

    res.status(201).json({
      data: mappedArticle,
      message: "Article added successfully",
      status: 201,
    });

    // If `image` is a base64/data URL then attempt to generate a blurred
    // preview and upload the real file.
    if (
      typeof image === "string" &&
      (image.startsWith("data:") ||
        image.startsWith("http://") ||
        image.startsWith("https://"))
    ) {
      // create blurred preview (background) and update article record
      blurBase64Image(image, `blur-${slug}`)
        .then((blurredPath) => {
          // update the blur_image column
          db.update(articles)
            .set({ blur_image: blurredPath })
            .where(eq(articles.slug, slug))
            .catch((err) =>
              console.error("Failed to add blur image to db :", err),
            );
        })
        .catch((err) =>
          console.error(
            "Failed to create blurred image  :    ",
            slug,
            "--------************-------",
            err,
          ),
        );

      try {
        // upload the original and replace the stored base64 with the URL
        const imageUrl = await saveBase64Image(image, slug);
        await db
          .update(articles)
          .set({ image: imageUrl })
          .where(eq(articles.slug, slug));
      } catch (err) {
        console.error(
          "Failed to save base64 image or update DB:   ",
          slug,
          err,
        );
        try {
          await db
            .update(articles)
            .set({ image })
            .where(eq(articles.slug, slug));
        } catch (innerErr) {
          console.error("Failed to persist fallback base64 image:", innerErr);
        }
      }
    } else {
    }

    // Attach the slugs of the categories to the categories field for better frontend filtering // only if the
    // categories does not match its slug in db

    for (const cat of categoriesValue) {
      if (typeof cat !== "string") {
        continue;
      }
      const categoryRow = await db
        .select()
        .from(categoriesDb)
        .where(sql`LOWER(${categoriesDb.name}) = ${cat.toLowerCase()}`)
        .limit(1);

      // add the slug of the category to the categoriesValue array if it exists and is not already included
      if (categoryRow.length) {
        const categorySlug = categoryRow[0].slug;
        if (!categoriesValue.includes(categorySlug)) {
          categoriesValue.push(categorySlug);
        }
      }
    }

    // Update the article with the generated slugs
    await db
      .update(articles)
      .set({ categories: JSON.stringify(categoriesValue) })
      .where(eq(articles.slug, slug));

    // update redis cache for all articles to include the new article with its category slugs
    const allArticles = await db
      .select()
      .from(articles)
      .orderBy(desc(articles.created_at));

    const mappedArticles = allArticles.map((article) => mapArticle(article));

    // cache the updated articles in redis with an expiration time of 10 minutes (600 seconds)
    await redis.set("all_articles", JSON.stringify(mappedArticles), "EX", 600);

    return;
  } catch (error) {
    console.error("Error adding article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getArticleByIdOrSlug = async (req, res) => {
  try {
    const { identifier } = req.params;

    //the identifier can be either id or slug
    // Robust ID detection: convert to number and check for integer
    const idNum = Number(identifier);
    let article;
    if (!Number.isNaN(idNum) && Number.isInteger(idNum)) {
      // Treat as numeric id
      article = await db
        .select()
        .from(articles)
        .where(eq(articles.id, idNum))
        .limit(1);
    } else {
      // Treat as slug: compare against stored `slug` column (case-insensitive)
      // NOTE: previously the code attempted to call createSlug on the DB column,
      // which is invalid. Querying the stored slug is reliable and efficient.
      article = await db
        .select()
        .from(articles)
        .where(
          sql`LOWER(${articles.slug}) = ${String(identifier).toLowerCase()}`,
        )
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

  const { id: reqId } = getUser(req);
  //validate user exists
  if (!reqId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("Updating article with ID:", id, "by user ID:", reqId);

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
    const now = getMySQLDateTime();

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

    if (existingArticle.length < 1 || !existingArticle[0]) {
      return res.status(404).json({ error: "Article not found" });
    }

    const articleAuthor = existingArticle[0].author || "";

    // Safely normalize strings before calling toLowerCase()
    const articleAuthorNormalized = String(articleAuthor).toLowerCase();
    const requestUserName = String(req.user?.name || "").toLowerCase();
    const requestUserRole = String(req.user?.role || "").toLowerCase();

    // Check if the requesting user is the author of the article or has admin privileges
    if (
      articleAuthorNormalized !== requestUserName &&
      requestUserRole !== "admin"
    ) {
      // In case a user changed name, fall back to checking author_id
      if (existingArticle[0]?.author_id !== Number(req.user?.id)) {
        console.log(
          "Forbidden: User is not the author or admin",
          req.user?.role,
          req.user?.id,
        );
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    // update categories counts if categories have changed
    const oldCategories = JSON.parse(existingArticle[0].categories || "[]");

    // Update category article counts for existing categories, decrement old categories

    for (const cat of oldCategories) {
      if (typeof cat !== "string") {
        continue;
      }
      await db
        .update(categoriesDb)
        .set({
          articleCount: sql`GREATEST(${categoriesDb.articleCount} - 1, 0)`,
        })
        .where(sql`LOWER(${categoriesDb.name}) = ${cat.toLowerCase()}`);
    }
    // Update category article counts for new categories, increment new categories

    for (const cat of categoriesValue) {
      if (typeof cat !== "string") {
        continue;
      }
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

    // Update user article counts: fetch the author row safely with limit(1)
    const userAuthor = await db
      .select()
      .from(users)
      .where(eq(users.id, existingArticle[0].author_id))
      .limit(1);

    if (!userAuthor.length) {
      // If the author row is missing, log and default counters to 0 (best-effort)
      console.warn("Author row not found when updating counts for article", id);
    }

    const total = userAuthor.length ? userAuthor[0].total_articles : 0;
    let published = userAuthor.length ? userAuthor[0].articles_published : 0;
    let drafted = userAuthor.length ? userAuthor[0].articles_drafted : 0;
    let pending = userAuthor.length ? userAuthor[0].articles_pending : 0;

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

    // send the updated article as response
    res.status(200).json({
      data: mappedArticle,
      message: "Article updated successfully",
      status: 200,
    });
    // update the new categories with the article slug for better frontend filtering
    // . find added categories not in old categories and attach the article slug to them
    for (const cat of categoriesValue) {
      if (typeof cat !== "string") {
        continue;
      }
      if (!oldCategories.includes(cat)) {
        // this is a new category added in the update, attach the article slug to it
        const categoryRow = await db
          .select()
          .from(categoriesDb)
          .where(sql`LOWER(${categoriesDb.name}) = ${cat.toLowerCase()}`)
          .limit(1);

        if (categoryRow.length < 1) {
          return;
        }
        // the slug
        const categorySlug = categoryRow[0].slug;
        // check if slug is in categoriesValue, if not add it and update the article record

        if (!categoriesValue.includes(categorySlug)) {
          categoriesValue.push(categorySlug);
          await db
            .update(articles)
            .set({ categories: JSON.stringify(categoriesValue) })
            .where(eq(articles.id, Number(id)));
        }
      }
    }
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
  // Check if article exists

  const existingArticle = await db
    .select()
    .from(articles)
    .where(eq(articles.id, Number(id)))
    .limit(1);
  // If article doesn't exist, return 404
  if (!existingArticle.length || !existingArticle[0]) {
    return res.status(404).json({ error: "Article not found" });
  }

  try {
    // Find the requesting user row (limit 1 for safety)
    const userAuthor = await db
      .select()
      .from(users)
      .where(eq(users.id, existingArticle[0].author_id))
      .limit(1);

    if (!userAuthor.length) {
      return res.status(404).json({ error: "Author user not found" });
    }

    if (!existingArticle.length) {
      return res.status(404).json({ error: "Article not found" });
    }

    // normalize strings
    const requestUserRole = String(req.user?.role || "").toLowerCase();

    // Check if the requesting user is the author of the article or has admin privileges
    const isAdmin = requestUserRole === "admin";
    const isAuthor = existingArticle[0].author_id === Number(req.user.id);

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Update user article count
    const total = userAuthor.length ? userAuthor[0].total_articles : 0;
    let published = userAuthor.length ? userAuthor[0].articles_published : 0;

    //  check if the deleted article was published

    if (existingArticle.length && existingArticle[0].status === "Published") {
      if (published > 0) {
        published -= 1;
      } else {
        published = 0;
      }
    }

    let articleCategories = [];
    try {
      articleCategories = JSON.parse(existingArticle[0].categories || "[]");
    } catch (err) {
      articleCategories = [];
    }

    // transaction to delete article and update counts atomically
    await db.transaction(async (tx) => {
      // update user article counts
      await tx
        .update(users)
        .set({
          total_articles: total > 0 ? total - 1 : 0,
          articles_published: published,
        })
        .where(eq(users.id, existingArticle[0].author_id));

      // update category counts
      for (const cat of articleCategories) {
        if (typeof cat !== "string") {
          continue;
        }

        await tx
          .update(categoriesDb)
          .set({
            articleCount: sql`GREATEST(${categoriesDb.articleCount} - 1, 0)`,
          })
          .where(sql`LOWER(${categoriesDb.name}) = ${cat.toLowerCase()}`);
      }

      // delete the article
      await tx.delete(articles).where(eq(articles.id, Number(id)));
    });

    return res.status(200).json({ message: "Article deleted successfully" });
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
      if (typeof cat !== "string") {
        continue;
      }
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
