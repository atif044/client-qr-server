class ErrorHandler extends Error {
  constructor(message, statusCode) {
      message=message?message:"Internal Server Error"
       statusCode=!isNaN(statusCode)?statusCode:500
      super(message);
      this.statusCode = statusCode;
      Error.captureStackTrace(this, this.constructor);
    }  
  }
  module.exports = ErrorHandler;
  