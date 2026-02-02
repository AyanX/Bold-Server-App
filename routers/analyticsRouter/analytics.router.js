//  /api/analytics/track

const express = require('express');
const { postAnalyticsData } = require('../../controllers/analyticsController/analytics.controller');
const analyticsRouter = express.Router();

analyticsRouter.get("/dashboard", (req, res) => {
  res.json ( {
  "data": {
    "stats": {
      "totalArticles": 156,
      "totalUsers": 25,
      "totalCategories": 8,
      "activeCampaigns": 3,
      "primeArticles": 12,
      "headlineArticles": 5,
      "recentActivity": 45,
      "totalPageViews": 45230,
      "todayPageViews": 1250,
      "uniqueVisitors": 8923
    },
    "audienceGrowth": [
      { "date": "2026-01-20", "visitors": 150 },
      { "date": "2026-01-21", "visitors": 175 }
    ],
    "dailyPageViews": [
      { "date": "2026-01-20", "views": 1050 },
      { "date": "2026-01-21", "views": 1200 }
    ],
    "monthlyPageViews": [
      { "month": "2026-01", "views": 35000 }
    ],
    "deviceBreakdown": {
      "mobile": 45,
      "tablet": 15,
      "desktop": 40
    },
    "topLocations": [
      { "country": "Kenya", "code": "KE", "visitors": 5000 },
      { "country": "Uganda", "code": "UG", "visitors": 1500 }
    ],
    "kenyaCounties": [
      { "county": "Nairobi", "visitors": 3000 },
      { "county": "Mombasa", "visitors": 800 }
    ],
    "articlesByCategory": [
      { "category": "Technology", "count": 45, "color": "#FF6B6B" }
    ],
    "usersByRole": {
      "Admin": 2,
      "Editor": 5,
      "Contributor": 12,
      "Viewer": 6
    },
    "liveTraffic": [
      { "page_title": "Home", "visitors": 15 },
      { "page_title": "Article 1", "visitors": 8 }
    ]
  },
  "status": 200
})
})

analyticsRouter.get("/logs", (req, res) => {
    res.json({ message: "api working" })
})

analyticsRouter.get("/active-visitors", (req, res) => {
    res.json({ message: "api working" })
})

analyticsRouter.post("/track", postAnalyticsData)

module.exports = analyticsRouter;