const ErrorHandler = require("../config/ErrorHandler");
const {
  isValidEmail,
  isValidPassword,
    normalizeEmail
} = require("./utils.validator");
const validatorLogin = (req, res, next) => {
    req.body.email=normalizeEmail(req.body.email)
    const { name, email, password} = req.body;
    if (email === "") {
      return next(new ErrorHandler("Email is a required Field", 400));
    }
     else if (!isValidEmail(req.body.email)) {
      return next(new ErrorHandler("Email is not Valid", 400));
    }
    else if(password===""){
      return next (new ErrorHandler("Password is a required field",400))
    }
    return next();
  };
  module.exports = validatorLogin;
  