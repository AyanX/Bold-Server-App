const express = require("express");
const articlesRouter = require("./routers/articlesRouter/articles.router");
const categoriesRouter = require("./routers/categoriesRouter/categories.router");
const campaignsRouter = require("./routers/campaignsRouter/campaigns.router");
const usersRouter = require("./routers/usersRouter/users.router");
const userManagementRouter = require("./routers/userManagementRouter/userManagement.Router");
const settingsRouter = require("./routers/settingsRouter/settings.router");
const profileRouter = require("./routers/profileRouter/profile.router");

const cors = require("cors");
const authRouter = require("./routers/authRouter/auth.router");
const analyticsRouter = require("./routers/analyticsRouter/analytics.router");

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Home route
app.get("/", (req, res) => {
  res.json({ message: "api working" });
});

// Articles routes
app.use("/api/articles", articlesRouter);

// Categories routes
app.use("/api/categories", categoriesRouter);

// Campaigns routes
app.use("/api/campaigns", campaignsRouter);

// Users routes
app.use("/api/users", usersRouter);

// User management routes
app.use("/api/users", userManagementRouter);

// Password reset routes
app.post("/api/forgot-password", (req, res) => {
  res.json({ message: "api working" });
});

app.post("/api/reset-password", (req, res) => {
  res.json({ message: "api working" });
});

// Article tracking endpoints
app.post("/api/articles/:id/view", (req, res) => {
  res.json({ message: "api working" });
});

app.post("/api/articles/:id/click", (req, res) => {
  res.json({ message: "api working" });
});

// Public ads endpoint
app.get("/api/ads/active", (req, res) => {
  res.json({ message: "api working" });
});

// Ad tracking endpoints
app.post("/api/ads/:id/impression", (req, res) => {
  res.json({ message: "api working" });
});

app.post("/api/ads/:id/click", (req, res) => {
  res.json({ message: "api working" });
});

// Analytics routes
app.use("/api/analytics", analyticsRouter);

// Settings routes
app.use("/api/settings", settingsRouter);

// Profile routes
app.use("/api/settings/profile", profileRouter);

// Performance metrics
app.get("/api/settings/performance", (req, res) => {
  res.json({ message: "api working" });
});

//auth router
app.use(authRouter);

module.exports = app;
