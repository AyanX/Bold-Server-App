const express = require('express');
const upload = require('../../utils/middleware/multer');
const AuthCheck = require('../../utils/authCheck/authCheck');
const {
    uploadInviteImage,
    acceptInvitation,
    uploadUserImage,
} = require('../../controllers/usersManagementController/users.management.controller');



const userManagementRouter = express.Router();

// Invitation routes
userManagementRouter.post("/invite/image", AuthCheck, upload.single('image'), uploadInviteImage);
userManagementRouter.post("/accept-invitation", acceptInvitation);
userManagementRouter.get("/invitations/list", AuthCheck, (req,res)=>res.send("api working"));
userManagementRouter.post("/invitations/:id/resend", AuthCheck, (req,res)=>res.send("api working")  );
userManagementRouter.delete("/invitations/:id", AuthCheck, (req,res)=>res.send("api working")    );

// User management routes
userManagementRouter.post("/:id/image", AuthCheck, upload.single('image'), uploadUserImage);
userManagementRouter.patch("/:id/status", AuthCheck, (req,res)=>res.send("api working")  );
userManagementRouter.post("/bulk-status", AuthCheck, (req,res)=>res.send("api working"));

// Statistics route
userManagementRouter.get("/statistics/overview", AuthCheck, (req,res)=>res.send("api working") );

module.exports = userManagementRouter;