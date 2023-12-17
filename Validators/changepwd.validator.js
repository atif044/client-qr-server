const ErrorHandler = require("../config/ErrorHandler");
const {
  isValidPassword, 
} = require("./utils.validator");

const changePwdValidator=(req,res,next)=>{
    if(req.body.oldPassword===""){
        return next(
            new ErrorHandler(
                "Old Password is a Required Field",400
            )
        )
    }
    else if(req.body.newPassword===""){
        return next(
            new ErrorHandler(
                "New Password is a Required Field",400
            )
        )
    }
    else if(!isValidPassword(req.body.newPassword)){
        return next(
            new ErrorHandler(
                "New Password Doesnt meet requirements",400
            )
        );
    }
    next();
}
module.exports =changePwdValidator