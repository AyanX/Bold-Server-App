const express = require('express');
const upload = require('../../utils/middleware/multer');
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



const userManagementRouter = express.Router();

// Invitation routes
// userManagementRouter.post("/invite", inviteUser);
userManagementRouter.post("/invite/image", upload.single('image'), uploadInviteImage);
userManagementRouter.post("/accept-invitation", acceptInvitation);
userManagementRouter.get("/invitations/list", getInvitationsList);
userManagementRouter.post("/invitations/:id/resend", resendInvitation);
userManagementRouter.delete("/invitations/:id", deleteInvitation);

// User management routes
userManagementRouter.post("/:id/image", upload.single('image'), uploadUserImage);
userManagementRouter.patch("/:id/status", updateUserStatus);
userManagementRouter.post("/bulk-status", bulkUpdateUserStatus);

// Statistics route
userManagementRouter.get("/statistics/overview", getUserStatistics);

module.exports = userManagementRouter;