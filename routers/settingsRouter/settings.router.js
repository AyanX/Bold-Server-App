const express = require('express');
const { getSettings,putSettings,passwordUpdate } = require('../../controllers/settingsController/settings.controller');

const settingsRouter = express.Router();

settingsRouter.get("/",getSettings)

settingsRouter.get("/group/:group", (req, res) => {
    res.json({ message: "api working" })
})
settingsRouter.put("/", putSettings)

settingsRouter.put("/:key",putSettings)

settingsRouter.post("/password", passwordUpdate)

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