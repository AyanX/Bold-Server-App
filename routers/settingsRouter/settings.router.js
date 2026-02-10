// api/settings

const express = require('express');
const { articleSettings,getSettings,putSettings,passwordUpdate, getSystemStats ,sideBarCollapsed} = require('../../controllers/settingsController/settings.controller');
const AuthCheck = require('../../utils/authCheck/authCheck');

const settingsRouter = express.Router();

settingsRouter.get("/", AuthCheck, getSettings)
settingsRouter.get("/sidebar-collapsed", AuthCheck, sideBarCollapsed)

settingsRouter.get("/article-settings", articleSettings)



settingsRouter.get("/theme", AuthCheck, (req, res) => {
        const data= {
        mode: "dark",
        primaryColor: "#e3ab10",
        accentColor: "#fc3d39"
    }
    res.json(data)
    
})

settingsRouter.get("/group/:group", AuthCheck, (req, res) => {
res.json({ message: "api working" })
})
settingsRouter.put("/", AuthCheck, putSettings)

settingsRouter.put("/:key", AuthCheck, putSettings)

settingsRouter.post("/password", AuthCheck, passwordUpdate)

settingsRouter.get("/export", AuthCheck, (req, res) => {
    res.json({ message: "api working" })
})

settingsRouter.get("/system-stats", AuthCheck, getSystemStats)

settingsRouter.post("/clear-cache", AuthCheck, (req, res) => {
    res.json({ message: "api working" })
})

settingsRouter.post("/reset/:group", AuthCheck, (req, res) => {
    res.json({ message: "api working" })
})


module.exports = settingsRouter;