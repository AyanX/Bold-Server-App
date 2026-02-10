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
const cookieParser = require("cookie-parser");
const cookieParserMiddleware = require("./utils/middleware/cookieParser");
const requestIp = require('request-ip')


const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(cookieParser());
app.set('trust proxy', true);

//set a users ip in req.clientIp
app.use(requestIp.mw());



// Serve static files from public directory (for uploads)
app.use("/storage", express.static("./public/storage"));





//ATTACH USER FROM COOKIE TOKEN
app.use(cookieParserMiddleware);

//auth router
app.use(authRouter);

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

// Profile routes
app.use("/api/settings/profile", profileRouter);



// Settings routes
app.use("/api/settings", settingsRouter);


// Performance metrics
app.get("/api/settings/performance", (req, res) => {
  res.json({ message: "api working" });
});



module.exports = app;
