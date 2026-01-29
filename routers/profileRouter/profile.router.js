const express = require('express');

const profileRouter = express.Router();

profileRouter.get("/", (req, res) => {
    res.json({ message: "api working" })
})

profileRouter.put("/", (req, res) => {
    res.json({ message: "api working" })
})

profileRouter.post("/image", (req, res) => {
    res.json({ message: "api working" })
})

module.exports = profileRouter;