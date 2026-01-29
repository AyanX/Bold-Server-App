const express = require('express');

const campaignsRouter = express.Router();

campaignsRouter.get("/", (req, res) => {
    res.json({ message: "api working" })
})

campaignsRouter.post("/", (req, res) => {
    res.json({ message: "api working" })
})

campaignsRouter.get("/:id", (req, res) => {
    res.json({ message: "api working" })
})

campaignsRouter.put("/:id", (req, res) => {
    res.json({ message: "api working" })
})

campaignsRouter.delete("/:id", (req, res) => {
    res.json({ message: "api working" })
})


module.exports = campaignsRouter;