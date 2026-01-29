const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    inviteUser,
    uploadInviteImage,
    acceptInvitation,
    getInvitationsList,
    resendInvitation,
    deleteInvitation,
    uploadUserImage,
    updateUserStatus,
    bulkUpdateUserStatus,
    getUserStatistics,
} = require('../../controllers/usersManagementController/users.management.controller');

// Ensure upload directory exists
const uploadDir = './public/storage/users/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const name = `user_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    cb(null, name + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5048 * 1024 }, // 5048 KB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

const userManagementRouter = express.Router();

// Invitation routes
userManagementRouter.post("/invite", inviteUser);
userManagementRouter.post("/invite/image", upload.single('image'), uploadInviteImage);
userManagementRouter.post("/accept-invitation", acceptInvitation);
userManagementRouter.get("/invitations/list", getInvitationsList);
userManagementRouter.post("/invitations/:id/resend", resendInvitation);
userManagementRouter.delete("/invitations/:id", deleteInvitation);

// User management routes
userManagementRouter.post("/:id/image", uploadUserImage);
userManagementRouter.patch("/:id/status", updateUserStatus);
userManagementRouter.post("/bulk-status", bulkUpdateUserStatus);

// Statistics route
userManagementRouter.get("/statistics/overview", getUserStatistics);

module.exports = userManagementRouter;