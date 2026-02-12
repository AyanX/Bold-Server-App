//  /api/analytics
const { pageViews } = require("../../drizzle/schema");
const db = require("../../db/db");
const { AnalyticsService } = require("./analytics.helper");
const { getClientIp, getMySQLDateTime } = require("../utils");

const redis = require("../../utils/redis.client");

const CACHE_TTL = 60 * 60 * 24; // 24 hours caching for IP data

const postAnalyticsData = async (req, res) => {
  try {
    const ip = getClientIp(req);

    let data;

    // check redis cache
    const cachedData = await redis.get(ip);

    if (cachedData) {
      data = JSON.parse(cachedData);
      console.log("Redis cache HIT for IP:", ip);
    } else {
      console.log("Redis cache MISS → calling ipapi");

      const response = await fetch(`https://ipapi.co/${ip}/json/`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      data = await response.json();

      //Save to Redis with TTL
      await redis.setEx(ip, CACHE_TTL, JSON.stringify(data));
    }

    const dateNow = getMySQLDateTime();

    const pageViewData = {
      sessionId: req.body.session_id,
      pageUrl: req.body.page_url,
      pageTitle: req.body.page_title,
      referrer: req.body.referrer,
      deviceType: req.body.device_type,
      browser: req.body.browser,
      os: req.body.os,
      screen_width: req.body.screen_width,
      ipAddress: ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      countryCode: data.country_code,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      timeOnPage: 0,
      createdAt: dateNow,
      updatedAt: dateNow,
    };

    await db.insert(pageViews).values(pageViewData);
    return res.status(200).json({
      message: "Location data fetched successfully",
      data: pageViewData,
    });
  } catch (error) {
    console.error("Error fetching location data:", error);
    return res.status(500).json({ message: "Failed to fetch location data" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      stats,
      audienceGrowth,
      dailyPageViews,
      monthlyPageViews,
      deviceBreakdown,
      topLocations,
      kenyaCounties,
      articlesByCategory,
      usersByRole,
      liveTraffic,
    ] = await Promise.all([
      AnalyticsService.getDashboardStats(),
      AnalyticsService.getAudienceGrowth(),
      AnalyticsService.getDailyPageViews(),
      AnalyticsService.getMonthlyPageViews(),
      AnalyticsService.getDeviceBreakdown(),
      AnalyticsService.getTopLocations(),
      AnalyticsService.getKenyaCounties(),
      AnalyticsService.getArticlesByCategory(),
      AnalyticsService.getUsersByRole(),
      AnalyticsService.getLiveTraffic(),
    ]);

    res.json({
      data: {
        stats: { ...stats, activeVisitors: liveTraffic.length },
        audienceGrowth,
        dailyPageViews,
        monthlyPageViews,
        deviceBreakdown,
        topLocations,
        kenyaCounties,
        articlesByCategory,
        usersByRole,
        liveTraffic,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      status: 500,
    });
  }
};

module.exports = {
  postAnalyticsData,
  getDashboardStats,
};
