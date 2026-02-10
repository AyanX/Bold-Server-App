// api/settings
const db = require("../../db/db");
const {
  settings,
  users,
  articles,
  pageViews,
  campaigns,
  categories,
} = require("../../drizzle/schema");
const { eq, count, sql } = require("drizzle-orm");
const { getMySQLDateTime, getUser } = require("../utils");
const { hashPassword, comparePassword } = require("../../utils/bcrypt/bcrypt");

const getSettings = async (req, res) => {
  try {
    const allSettings = await db.select().from(settings);

    // Parse values based on type before sending
    const parsedSettings = allSettings.map((setting) => {
      let parsedValue = setting.value;
      switch (setting.type) {
        case "boolean":
          parsedValue = setting.value === "true" || setting.value === "1";
          break;
        case "number":
          parsedValue = parseFloat(setting.value);
          if (isNaN(parsedValue)) parsedValue = 0;
          break;
        case "integer":
          parsedValue = parseInt(setting.value, 10);
          if (isNaN(parsedValue)) parsedValue = 0;
          break;
        default:
          // string or unknown, keep as is
          break;
      }
      return {
        ...setting,
        value: parsedValue,
      };
    });

    return res.status(200).json({
      status: 200,
      message: "Settings fetched successfully",
      data: parsedSettings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const putSettings = async (req, res) => {
  const dateUpdated = getMySQLDateTime();
  const settingsData = req.body;

  try {
    // Update each setting key with the new value and updatedAt
    for (const [key, value] of Object.entries(settingsData)) {
      await db
        .update(settings)
        .set({ value: value, updatedAt: dateUpdated })
        .where(eq(settings.key, key));
    }

    // Fetch all settings after update
    const allSettings = await db.select().from(settings);

    return res.status(200).json({
      status: 200,
      message: "Settings updated successfully",
      data: allSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const passwordUpdate = async (req, res) => {
  const { email } = getUser(req, res);
  const { current_password, password, password_confirmation } = req.body;

  //   example request body
  //   {
  //     "password":"robotic123",
  //     "current_password":"newrobotic123",
  //     "password_confirmation":"robotic123"
  //   }

  try {
    // Fetch user by email
    const userFound = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    //if user not found return 404
    if (userFound.length === 0) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }
    const user = userFound[0];

    // Check if current password matches
    const isMatch = await comparePassword(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 400,
        message: "Current password is incorrect",
      });
    }

    // Check if new password and confirmation match
    if (password !== password_confirmation) {
      return res.status(400).json({
        status: 400,
        message: "Password confirmation does not match",
      });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user's password in the database
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: getMySQLDateTime() })
      .where(eq(users.email, email));

    return res.status(200).json({
      status: 200,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

async function getSystemStats(req, res) {
  try {
    // Count records from each table
    const [totalArticles] = await db.select({ count: count() }).from(articles);
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalPageViews] = await db
      .select({ count: count() })
      .from(pageViews);
    const [totalCampaigns] = await db
      .select({ count: count() })
      .from(campaigns);
    const [totalCategories] = await db
      .select({ count: count() })
      .from(categories);

    const settingsDB = await db.select().from(settings);

    const timezoneSetting = settingsDB.find((s) => s.key === "timezone");

    //find database size in MB
    const dbName = process.env.DB_NAME;

    const result = await db.execute(sql`
  SELECT 
    table_schema AS database_name,
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
  FROM information_schema.tables
  WHERE table_schema = ${dbName}
  GROUP BY table_schema
`);
    const database_size =
      result[0][0] && result[0][0].size_mb ? `${result[0][0].size_mb} MB` : "Null";

    // For last_backup, since it's not in the schema
    const lastBackup = "2026-01-26T06:00:00Z";

    const data = {
      total_articles: totalArticles.count,
      total_users: totalUsers.count,
      total_page_views: totalPageViews.count,
      total_campaigns: totalCampaigns.count,
      database: {
        articles: totalArticles.count,
        users: totalUsers.count,
        page_views: totalPageViews.count,
        campaigns: totalCampaigns.count,
        categories: totalCategories.count,
      },
      system: {
        database_size,
        node_version: process.version,
        server_uptime: process.uptime(),
        express_version: require("express/package.json").version,
        timezone: timezoneSetting ? timezoneSetting.value : "UTC",
      },
      storage: {
        database_size,
      },
      last_backup: lastBackup,
    };

    return res.status(200).json({
      data,
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching system stats:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
}

const sideBarCollapsed = async (req, res) => {
  try {
    const collapsed = await db.select().from(settings).where(eq(settings.key, "sidebar_collapsed"));
    if (collapsed.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Setting not found",
      });
    }
    // Normalize stored value to a real boolean. The DB stores values as strings
    // so ensure we interpret "true"/"1" as true and everything else as false.
    const rawVal = collapsed[0].value;
    const collapsedBool = rawVal === true || rawVal === 'true' || rawVal === '1';

    return res.status(200).json({
      status: 200,
      message: "Sidebar collapsed state fetched successfully",
      data: {
        collapsed: !collapsedBool,
      },
    });
  } catch (error) {
    console.error("Error updating sidebar state:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
}

const articleSettings = async( req,res)=>{
  try {
    const default_status = await db.select().from(settings).where(eq(settings.key, "default_article_status"));
  const require_featured_image = await db.select().from(settings).where(eq(settings.key, "require_featured_image"));

  const isImageRequired =  require_featured_image[0].value === true || require_featured_image[0].value === 'true' || require_featured_image[0].value=== '1';
  return res.status(200).json({
    data:{
      default_status:default_status[0].value,
      require_featured_image: isImageRequired
    }
  })


  } catch (error) {
    console.error("Error fetching article settings:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }



}


module.exports = {
  getSettings,
  articleSettings,
  getSystemStats,
  putSettings,
  passwordUpdate,
  sideBarCollapsed
};
