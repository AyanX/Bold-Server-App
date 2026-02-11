//  /api/analytics

const express = require('express');
const { postAnalyticsData , getDashboardStats} = require('../../controllers/analyticsController/analytics.controller');
const analyticsRouter = express.Router();
const AuthCheck  = require('../../utils/authCheck/authCheck');

analyticsRouter.get("/dashboard", AuthCheck, getDashboardStats);

analyticsRouter.get("/logs", AuthCheck, (req, res) => {
    res.json({ message: "api working" })
})

analyticsRouter.get("/active-visitors", AuthCheck, (req, res) => {
    res.json({ message: "api working" })
})

analyticsRouter.post("/track", postAnalyticsData)

module.exports = analyticsRouter;