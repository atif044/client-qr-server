const ErrorHandler = require("../config/ErrorHandler");
module.exports = shippingValidator=(req,res,next)=>{
    if(req.body.country===""){
        return next(
            new ErrorHandler("Country is a required field",400)
        )
    }
    else if(req.body.city===""){
        return next(
            new ErrorHandler("City is a required field",400)
        )
    }
    else if(req.body.Address1===""){
        return next(
            new ErrorHandler("City is a required field",400)
        )
    }
    else if(req.body.phoneNo===""){
        return next(
            new ErrorHandler("City is a required field",400)
        )
    }
    next()
}