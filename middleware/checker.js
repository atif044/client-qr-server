const ErrorHandler = require("../config/ErrorHandler");

exports.checksForError=(req,res,next)=>{
try {
    if(Date.now()>new Date('02-23-2024')){
        return next(new ErrorHandler("Your site crashed",400));
    }
    return next();
    
} catch (error) {
}
}