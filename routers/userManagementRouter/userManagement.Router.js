const express = require('express');

const userManagementRouter = express.Router();


userManagementRouter.post("/invite", (req, res) => {
    res.json({ message: "api working" })
})

userManagementRouter.post("/invite/image", (req, res) => {
    res.json({ message: "api working" })
})

userManagementRouter.post("/accept-invitation", (req, res) => {
    res.json({ message: "api working" })
})

userManagementRouter.get("/invitations/list", (req, res) => {
    res.json({ message: "api working" })
})

userManagementRouter.post("/invitations/:id/resend", (req, res) => {
    res.json({ message: "api working" })
})

userManagementRouter.delete("/invitations/:id", (req, res) => {
    res.json({ message: "api working" })
})

userManagementRouter.post("/:id/image", (req, res) => {
    res.json({ message: "api working" })
})

userManagementRouter.patch("/:id/status", (req, res) => {
    res.json({ message: "api working" })
})

userManagementRouter.post("/bulk-status", (req, res) => {
    res.json({ message: "api working" })
})  

userManagementRouter.get("/statistics/overview", (req, res) => {
    res.json({ message: "api working" })
})


module.exports = userManagementRouter;