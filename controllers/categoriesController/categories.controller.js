const { categories, articles } = require("../../drizzle/schema");
const db = require("../../db/db");
const { eq, like, sql } = require("drizzle-orm");
const { capitalizeFirstLetter, getMySQLDateTime } = require("../utils");

const getAllCategories = async (req, res) => {
  try {
    const { search } = req.query;
    let query = db.select().from(categories);

    // Optional search filter
    if (search && search.trim()) {
      query = query.where(like(categories.name, `%${search.trim()}%`));
    }

    const allCategories = await query;
    return res.status(200).json({
      data: allCategories,
      status: 200,
      message: "Categories fetched successfully",
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      error: err.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, color, article_count } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(422).json({
        message: "Validation failed",
        status: 422,
        errors: {
          name: ["The name field is required and must be a valid string."],
        },
      });
    }

    if (name.length > 255) {
      return res.status(422).json({
        message: "Validation failed",
        status: 422,
        errors: {
          name: ["The name field must not exceed 255 characters."],
        },
      });
    }

    if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
      return res.status(422).json({
        message: "Validation failed",
        status: 422,
        errors: {
          slug: ["The slug field is required and must be a valid string."],
        },
      });
    }

    // Check for unique slug
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug.trim().toLowerCase()))
      .limit(1);

    if (existingCategory.length > 0) {
      return res.status(422).json({
        message: "Validation failed",
        status: 422,
        errors: {
          slug: ["The slug has already been taken."],
        },
      });
    }

    // Validate color (hex format)
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    const categoryColor = color || "#001733";
    if (!hexColorRegex.test(categoryColor)) {
      return res.status(422).json({
        message: "Validation failed",
        status: 422,
        errors: {
          color: ["The color must be a valid hex color code (e.g., #FF5733)."],
        },
      });
    }

    // Insert new category
    const now = getMySQLDateTime();

    //  TRANSFORM THE NEW CATEGORY NAME TO USE FIRST LETTERS AS CAPITAL WORDS

    const formattedName = capitalizeFirstLetter(name);

    await db.insert(categories).values({
      name: formattedName,
      slug: slug.trim().toLowerCase(),
      color: categoryColor,
      articleCount: article_count || 0,
      createdAt: now,
      updatedAt: now,
    });

    // Fetch the created category
    const newCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug.trim().toLowerCase()))
      .limit(1);

    return res.status(201).json({
      data: newCategory[0],
      message: "Category created successfully",
      status: 201,
    });
  } catch (error) {
    console.error(" Error creating category:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      error: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid category ID",
        status: 400,
      });
    }

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, Number(id)))
      .limit(1);

    if (category.length === 0) {
      return res.status(404).json({
        message: "Category not found",
        status: 404,
      });
    }

    console.log(`📂 Fetched category:`, category[0]);

    return res.status(200).json({
      data: category[0],
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error fetching category:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, color, description } = req.body;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid category ID",
        status: 400,
      });
    }

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, Number(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return res.status(404).json({
        message: "Category not found",
        status: 404,
      });
    }

    // Build update object with only provided fields
    const updateData = {};

    // Validate and add name
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return res.status(422).json({
          message: "Validation failed",
          status: 422,
          errors: {
            name: ["The name field must be a valid string."],
          },
        });
      }
      if (name.length > 255) {
        return res.status(422).json({
          message: "Validation failed",
          status: 422,
          errors: {
            name: ["The name field must not exceed 255 characters."],
          },
        });
      }
      updateData.name = name.trim();
    }

    // Validate and add slug
    if (slug !== undefined) {
      const slugTrimmed = slug.trim().toLowerCase();
      // Check if new slug is unique (excluding current category)
      const duplicateSlug = await db
        .select()
        .from(categories)
        .where(
          sql`${categories.slug} = ${slugTrimmed} AND ${categories.id} != ${Number(id)}`,
        )
        .limit(1);

      if (duplicateSlug.length > 0) {
        return res.status(422).json({
          message: "Validation failed",
          status: 422,
          errors: {
            slug: ["The slug has already been taken."],
          },
        });
      }
      updateData.slug = slugTrimmed;
    }

    // Validate and add color
    if (color !== undefined) {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      if (!hexColorRegex.test(color)) {
        return res.status(422).json({
          message: "Validation failed",
          status: 422,
          errors: {
            color: [
              "The color must be a valid hex color code (e.g., #FF5733).",
            ],
          },
        });
      }
      updateData.color = color;
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    // Always update the updatedAt timestamp
    updateData.updatedAt = getMySQLDateTime();

    // Update category
    await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, Number(id)));

    // Fetch updated category
    const updatedCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, Number(id)))
      .limit(1);

    res.status(200).json({
      data: updatedCategory[0],
      message: "Category updated successfully",
      status: 200,
    });

    // if the slug was changed, update the slugs of all articles that belong to this category

    if (
      existingCategory[0].slug !== updateData.slug &&
      updateData.slug !== undefined
    ) {
      const articlesToUpdate = await db
        .select()
        .from(articles)
        .where(
          like(
            articles.categories,
            `%${existingCategory[0].slug.toLowerCase()}%`,
          ),
        );

      for (const article of articlesToUpdate) {
        const articleCategories = JSON.parse(article.categories);
        const updatedCategories = articleCategories.map((cat) => {
          if (cat.toLowerCase() === existingCategory[0].slug.toLowerCase()) {
            return updateData.slug;
          }
          return cat;
        });

        await db
          .update(articles)
          .set({ categories: JSON.stringify(updatedCategories) })
          .where(eq(articles.id, article.id));
      }
    }
    // for each articles, get categories, parse them, find the category with the old slug, replace it with the new slug, then update the article with the new categories

    return;
  } catch (error) {
    console.error(" Error updating category:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid category ID",
        status: 400,
      });
    }

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, Number(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return res.status(404).json({
        message: "Category not found",
        status: 404,
      });
    }

    const categoryName = existingCategory[0].name;

    // Delete the category
    await db.delete(categories).where(eq(categories.id, Number(id)));

    console.log(`🗑️ Category deleted:`, categoryName);

    return res.status(200).json({
      message: "Category deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error deleting category:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      error: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
