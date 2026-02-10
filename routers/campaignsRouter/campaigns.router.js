const express = require('express');
const AuthCheck = require('../../utils/authCheck/authCheck');

const campaignsRouter = express.Router();

campaignsRouter.get("/", AuthCheck, (req, res) => {
    res.json({ message: "api working" })
})

campaignsRouter.post("/", AuthCheck, (req, res) => {
    res.json({ message: "api working" })
})

campaignsRouter.get("/:id", AuthCheck, (req, res) => {
    res.json({ message: "api working" })
})

campaignsRouter.put("/:id", AuthCheck, (req, res) => {
    res.json({ message: "api working" })
})

campaignsRouter.delete("/:id", AuthCheck, (req, res) => {
    res.json({ message: "api working" })
})


module.exports = campaignsRouter;