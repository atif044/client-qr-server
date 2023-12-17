const ErrorHandler = require("../config/ErrorHandler")
const db=require('../database/db');
exports.checkIfAdmin=async(req,res,next)=>{
    let result=await db.query("select * from users where email = ?",[req.userData.user.email]);
    if(result[0][0].isAdmin===1){
        return next()
    }
      return next(new ErrorHandler("You Are not the admin",400));
}