const express = require('express');
const upload = require('../../utils/middleware/multer');
const AuthCheck = require('../../utils/authCheck/authCheck');
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
userManagementRouter.post("/invite/image", AuthCheck, upload.single('image'), uploadInviteImage);
userManagementRouter.post("/accept-invitation", acceptInvitation);
userManagementRouter.get("/invitations/list", AuthCheck, getInvitationsList);
userManagementRouter.post("/invitations/:id/resend", AuthCheck, resendInvitation);
userManagementRouter.delete("/invitations/:id", AuthCheck, deleteInvitation);

// User management routes
userManagementRouter.post("/:id/image", AuthCheck, upload.single('image'), uploadUserImage);
userManagementRouter.patch("/:id/status", AuthCheck, updateUserStatus);
userManagementRouter.post("/bulk-status", AuthCheck, bulkUpdateUserStatus);

// Statistics route
userManagementRouter.get("/statistics/overview", AuthCheck, getUserStatistics);

module.exports = userManagementRouter;