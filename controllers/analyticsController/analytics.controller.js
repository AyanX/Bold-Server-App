//  /api/analytics
const {pageViews} = require("../../drizzle/schema");
const db = require("../../db/db");

const { getClientIp, getMySQLDateTime } = require("../utils");

const cache = new Map();

const postAnalyticsData = async (req, res) => {
  try {
    const ip = getClientIp(req);

    //check the ip in cache
    if (cache.has(ip)) {
        console.log("Cache hit for IP:", ip);
       return res.json(cache.get(ip));
    }

    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    const dateNow = getMySQLDateTime();
    // data = ({
    //   ip,
    //   city: 
    //   region: 
    //   country: 
    //   country_code: 
    //   latitude:
    //   longitude:
    //   timezone: 
    //   org :=>    isp: 
    //   currency: 
    // });

// req body
//  {
//   session_id: 'sess_1769860310258_l7kg460pydp',
//   page_url: 'http://localhost:3000/#/category/latest',
//   page_title: 'The Bold East Africa | Intelligence for the Modern Leader',
//   referrer: 'http://localhost:3000/',
//   device_type: 'desktop',
//   browser: 'Chrome',
//   os: 'Linux',
//   screen_width: 1536
// }

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
      timeOnPage:0,
      createdAt: dateNow,
      updatedAt: dateNow,
    }

     await db.insert(pageViews).values(pageViewData);


    // cache the response for future use

    cache.set(ip, data);

    console.log("Page view data stored:", pageViewData);

    return res
      .status(200)
      .json({ message: "Location data fetched successfully", data: pageViewData });
  } catch (error) {
    console.error("Error fetching location data:", error);
    return res.status(500).json({ message: "Failed to fetch location data" });
  }
};

module.exports = {
  postAnalyticsData,
}