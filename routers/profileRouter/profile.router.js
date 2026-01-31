//      /api/settings/profile
const { uploadProfileImage , getProfile, updateProfile} = require('../../controllers/ProfileController/profile.controller');
const upload = require('../../utils/middleware/multer');
const express = require('express');

const profileRouter = express.Router();

profileRouter.get("/", getProfile)

profileRouter.put("/", updateProfile)

profileRouter.post("/image", upload.single('image'),  uploadProfileImage)

module.exports = profileRouter;