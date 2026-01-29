const { articles } = require("../../drizzle/schema");
const db = require("../../db/db");
const { desc, eq } = require("drizzle-orm");

 const getAllArticles = async (req, res) => {
  try {
    const allArticles = await db
      .select()
      .from(articles)

    function mapArticle(dbArticle) {
      return {
        id: String(dbArticle.id),
        title: dbArticle.title,
        slug: dbArticle.slug,
        excerpt: dbArticle.excerpt ?? "",
        image: dbArticle.image,
        category: dbArticle.category,
        categories: Array.isArray(dbArticle.categories)
          ? dbArticle.categories
          : dbArticle.categories
            ? Object.values(dbArticle.categories)
            : [],
        author: dbArticle.author ?? "",
        date: dbArticle.created_at,
        readTime: dbArticle.read_time ?? "5 min read",
        isPrime: Boolean(dbArticle.is_prime),
        isHeadline: Boolean(dbArticle.is_headline),
        status: dbArticle.status ?? "Draft",
        metaTags: Array.isArray(dbArticle.meta_tags)
          ? dbArticle.meta_tags
          : dbArticle.meta_tags
            ? Object.values(dbArticle.meta_tags)
            : [],
        metaDescription: dbArticle.meta_description ?? "",
        seoScore: dbArticle.seo_score ?? 0,
        views: dbArticle.views ?? 0,
        clicks: dbArticle.clicks ?? 0,
        content: dbArticle.content ?? "",
        created_at: dbArticle.created_at,
        updated_at: dbArticle.updated_at,
      };
    }

    const mappedArticles = allArticles.map((article) => mapArticle(article));

    return res.status(200).json({
      "data": mappedArticles,
      "status": 200,
      "message": "Articles fetched successfully",
    });
  
  } catch (err) {
    console.log("Error fetching articles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



const addNewArticle = async (req, res) => {
  //if categories or tags are arrays, turn them into json objects

  const {
    categories,
    tags,
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
    metaTags,
  } = req.body;

  console.log("Adding new article with data:", req.body);

  try {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    
    // Validate and format categories (MySQL SET requires array or comma-separated string)
    let categoriesValue = [];
    if (categories && Array.isArray(categories)) {
      // Filter to only valid category values
      const validCategories = [
        "Latest News",
        "Headline News",
        "Technology",
        "Sports",
      ];
      categoriesValue = categories.filter(cat => validCategories.includes(cat));
    }
    
    await db.insert(articles).values({
      categories: categoriesValue,
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
      created_at: now,
      updated_at: now,
    });

    latestArticle = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, slug))
      .limit(1);

    latestArticle = latestArticle[0];
    console.log("New article added:", latestArticle);

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

const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await db
      .select()
      .from(articles)
      .where(eq(articles.id, Number(id)))
      .limit(1);

    if (!article.length) {
      return res.status(404).json({ error: "Article not found" });
    }

    const dbArticle = article[0];

    function mapArticle(article) {
      return {
        id: String(article.id),
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt ?? "",
        image: article.image,
        category: article.category,
        categories: Array.isArray(article.categories)
          ? article.categories
          : article.categories
            ? Object.values(article.categories)
            : [],
        author: article.author ?? "",
        date: article.created_at,
        readTime: article.read_time ?? "5 min read",
        isPrime: Boolean(article.is_prime),
        isHeadline: Boolean(article.is_headline),
        status: article.status ?? "Draft",
        metaTags: Array.isArray(article.meta_tags)
          ? article.meta_tags
          : article.meta_tags
            ? Object.values(article.meta_tags)
            : [],
        metaDescription: article.meta_description ?? "",
        seoScore: article.seo_score ?? 0,
        views: article.views ?? 0,
        clicks: article.clicks ?? 0,
        content: article.content ?? "",
        created_at: article.created_at,
        updated_at: article.updated_at,
      };
    }

    const mappedArticle = mapArticle(dbArticle);

    res.status(200).json({ data: mappedArticle, status: 200 });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateArticleById = (req, res) => {
  res.json({ message: "api working" });
};

const deleteArticleById = (req, res) => {
  res.json({ message: "api working" });
};

module.exports = {
  addNewArticle,
  getAllArticles,
  getArticleById,
  updateArticleById,
  deleteArticleById,
};
