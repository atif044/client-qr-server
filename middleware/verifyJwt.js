const jwt = require("jsonwebtoken");
const ErrorHandler = require("../config/ErrorHandler");
const verifyAuth = (req, res, next) => {
  try {
    // Check if the Authorization header is present and has the correct format
    const authToken =
      req.cookies["rememberedAlways"] || req.headers["rememberedAlways"];
    if (!authToken) {
      return next(new ErrorHandler("Unauthorized Access",401));
    }
    const data = jwt.verify(authToken, process.env.JWT_SIGNATURE);
    if (new Date() > new Date(data.exp * 1000)) {
      // clearing the cookie
      res.clearCookie("rememberedAlways", {
        path: "/",
      });
      return next(new ErrorHandler("Token has Expired",401));
    }
    if (data !== undefined) {
      req.userData = data;
    }
    return next();
  } catch (error) {
    return next(new ErrorHandler("Forbidden! Please login to continue",403))
  }
};
module.exports = verifyAuth;
