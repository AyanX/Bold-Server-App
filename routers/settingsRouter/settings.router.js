// api/settings

const express = require('express');
const { getSettings,putSettings,passwordUpdate, getSystemStats } = require('../../controllers/settingsController/settings.controller');

const settingsRouter = express.Router();

settingsRouter.get("/",getSettings)

settingsRouter.get("/theme", (req, res) => {
        const data= {
        mode: "dark",
        primaryColor: "#e3ab10",
        accentColor: "#fc3d39"
    }
    res.json(data)
    
})

settingsRouter.get("/group/:group", (req, res) => {
res.json({ message: "api working" })
})
settingsRouter.put("/", putSettings)

settingsRouter.put("/:key",putSettings)

settingsRouter.post("/password", passwordUpdate)

settingsRouter.get("/export", (req, res) => {
    res.json({ message: "api working" })
})

settingsRouter.get("/system-stats", getSystemStats)

settingsRouter.post("/clear-cache", (req, res) => {
    res.json({ message: "api working" })
})

settingsRouter.post("/reset/:group", (req, res) => {
    res.json({ message: "api working" })
})


module.exports = settingsRouter;