//      /api/settings/profile
const { uploadProfileImage , getProfile, updateProfile} = require('../../controllers/ProfileController/profile.controller');
const upload = require('../../utils/middleware/multer');
const express = require('express');
const AuthCheck = require('../../utils/authCheck/authCheck');

const profileRouter = express.Router();

profileRouter.get("/", AuthCheck, getProfile)

profileRouter.put("/", AuthCheck, updateProfile)

profileRouter.post("/image", AuthCheck, upload.single('image'),  uploadProfileImage)

module.exports = profileRouter;