

const AuthCheck = (req,res,next) => {
    // Check if the user is authenticated
    if (!req.user?.id) {
        console.warn("Unauthorized access attempt detected");
        return res.status(401).json({
            status: 401,
            message: "Unauthorized: User not authenticated",
        });
    }
    return next();
}

module.exports = AuthCheck;