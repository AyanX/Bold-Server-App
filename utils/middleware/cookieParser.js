//attach req user from cookie token
const { verifyToken } = require("../../utils/jwt/jwt");

const cookieParserMiddleware = (req, res, next) => {
  const token = req?.cookies?.token;

  if (!token) {
    req.user={};
    return next();
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
//     {
//   id: 5,
//   role: 'Admin',
//   email: 'xhadyayan11@gmail.com',
//   iat: 1769799010,
//   exp: 1769802610,
 //     name:xyz
// }

   return next();
  } catch (error) {
    console.error("Cookie parsing error:", error.message);
    return next();
  }
};

module.exports = cookieParserMiddleware;
