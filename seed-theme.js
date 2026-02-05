const db = require("../db/db");
const { settings } = require("../drizzle/schema");

async function seedThemeSettings() {
  try {
    const themeSettings = [
      { key: "theme_mode", value: "light", type: "string", group: "theme" },
      { key: "theme_primary_color", value: "#001733", type: "string", group: "theme" },
      { key: "theme_accent_color", value: "#e5002b", type: "string", group: "theme" },
    ];

    for (const setting of themeSettings) {
      await db.insert(settings).values(setting).onDuplicateKeyUpdate({
        set: { value: setting.value, updatedAt: new Date() },
      });
    }

    console.log("Theme settings seeded successfully");
  } catch (error) {
    console.error("Error seeding theme settings:", error);
  } finally {
    process.exit();
  }
}

seedThemeSettings();