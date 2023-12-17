const db=require("../database/db")
const ErrorHandler=require("../config/ErrorHandler");
exports.CountVideosAndImages=async(req,res,next)=>{
    const email=req.userData.user.email;
    try {
        let result=await db.query("select count(datalink) as count from media where email = ?",[email]);
        if(result[0][0].count>=10){
            return next(new ErrorHandler("You can only upload max 10 photos/videos",400))
        }
         next();
    } catch (error) {
        return next(new ErrorHandler(error.message,error.code||error.statusCode));
    }
}
