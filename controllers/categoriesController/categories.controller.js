const { categories, articles } = require("../../drizzle/schema");
const db = require("../../db/db");
const { eq, like, sql } = require("drizzle-orm");
const { capitalizeFirstLetter } = require("../utils");

/**
 * GET /api/categories
 * Fetch all categories with optional search filter
 */
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

/**
 * POST /api/categories
 * Create a new category
 */
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
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

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

/**
 * GET /api/categories/:id
 * Fetch a single category by ID
 */
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

/**
 * PUT /api/categories/:id
 * Update a category by ID
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, color, article_count } = req.body;

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

    // Add articleCount if provided
    if (article_count !== undefined) {
      if (typeof article_count !== "number" || article_count < 0) {
        return res.status(422).json({
          message: "Validation failed",
          status: 422,
          errors: {
            article_count: ["The article_count must be a non-negative number."],
          },
        });
      }
      updateData.articleCount = article_count;
    }

    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

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

    console.log(`✏️ Category updated:`, updatedCategory[0]);

    return res.status(200).json({
      data: updatedCategory[0],
      message: "Category updated successfully",
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error updating category:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      error: error.message,
    });
  }
};

/**
 * DELETE /api/categories/:id
 * Delete a category by ID
 * Note: Does not cascade delete articles - they keep their category reference
 */
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
