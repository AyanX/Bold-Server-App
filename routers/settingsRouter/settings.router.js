const express = require('express');

const settingsRouter = express.Router();

settingsRouter.get("/", (req, res) => {
    res.json({ message: "api working" })
})

settingsRouter.get("/group/:group", (req, res) => {
    res.json({ message: "api working" })
})
settingsRouter.put("/", (req, res) => {
    res.json({ message: "api working" })
})

settingsRouter.put("/:key", (req, res) => {
    res.json({ message: "api working" })
})

settingsRouter.post("/password", (req, res) => {
    res.json({ message: "api working" })
})

settingsRouter.get("/export", (req, res) => {
    res.json({ message: "api working" })
})

settingsRouter.get("/system-stats", (req, res) => {
    res.json({ message: "api working" })
})

settingsRouter.post("/clear-cache", (req, res) => {
    res.json({ message: "api working" })
})

settingsRouter.post("/reset/:group", (req, res) => {
    res.json({ message: "api working" })
})


module.exports = settingsRouter;