const ErrorHandler = require("../config/ErrorHandler");
const {
  isValidEmail,
  isValidPassword,
    isValidName,
    normalizeEmail
} = require("./utils.validator");

const validatorSignup = (req, res, next) => {
  req.body.email=normalizeEmail(req.body.email)
  const { name, email, password} = req.body;
  if (name === "") {
    return next(new ErrorHandler("Name is a Required Field", 400));
  } else if (!isValidName(name)) {
    next(
      new ErrorHandler("Name must be alteast 3 character and max 50", 400)
    );
  }
  else if (email === "") {
    return next(new ErrorHandler("Email is a required Field", 400));
  }
   else if (!isValidEmail(req.body.email)) {
    return next(new ErrorHandler("Email is not Valid", 400));
  }
  else if(password===""){
    return next (new ErrorHandler("Password is a required field",400))
  }
  else if (!isValidPassword(password)) {
    return next(new ErrorHandler("Password doesn't meet requirements", 400));
  }
  return next();
};
module.exports = validatorSignup;
