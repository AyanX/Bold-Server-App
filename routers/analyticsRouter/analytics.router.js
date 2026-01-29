const express = require('express');
const analyticsRouter = express.Router();

analyticsRouter.get("/dashboard", (req, res) => {
    res.json({ message: "api working" })
})

analyticsRouter.get("/logs", (req, res) => {
    res.json({ message: "api working" })
})

analyticsRouter.get("/active-visitors", (req, res) => {
    res.json({ message: "api working" })
})

analyticsRouter.post("/track", (req, res) => {
    res.json({ message: "api working" })
})

module.exports = analyticsRouter;