const express = require("express");
const path = require("path");
const articlesRouter = require("./routers/articlesRouter/articles.router");
const categoriesRouter = require("./routers/categoriesRouter/categories.router");
const campaignsRouter = require("./routers/campaignsRouter/campaigns.router");
const usersRouter = require("./routers/usersRouter/users.router");
const userManagementRouter = require("./routers/userManagementRouter/userManagement.Router");
const settingsRouter = require("./routers/settingsRouter/settings.router");
const profileRouter = require("./routers/profileRouter/profile.router");

const authRouter = require("./routers/authRouter/auth.router");
const analyticsRouter = require("./routers/analyticsRouter/analytics.router");
const cookieParser = require("cookie-parser");
const cookieParserMiddleware = require("./utils/middleware/cookieParser");
const requestIp = require('request-ip')
const swaggerUi = require("swagger-ui-express")
const rateLImiter = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const YAML = require("yamljs")
const morgan = require('morgan');


const swaggerJSDocs = YAML.load("./api.yaml")

//rate limiter configuration
const limiter = rateLImiter({
  windowMs: 40 * 60 * 1000, // 40 minutes
  max: 100000000, // limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});


const app = express();
// Swagger API documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJSDocs) )



// Configure helmet to allow cross-origin resource loading for static assets
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);


app.use(cookieParser());
app.set('trust proxy', 1);


// Enable ETag generation for caching
app.set('etag', true);

//set a users ip in req.clientIp
app.use(requestIp.mw());

// Serve static files from public directory (for uploads)
// Ensure CORS header is present on static responses so frontend can load images
app.use(
  "/storage",
  express.static(path.join(__dirname, "public", "storage"), {
    setHeaders(res, filePath) {
      const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    },
  }),
);


// Apply rate limiter to all requests
app.use(limiter);

//ATTACH USER FROM COOKIE TOKEN
app.use(cookieParserMiddleware);

// Articles routes
app.use("/api/articles", articlesRouter);

// Use morgan for logging in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


//auth router
app.use(authRouter);

// Home route
app.get("/", (req, res) => {
  res.json({ message: "api working" });
});



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
module.exports = app
