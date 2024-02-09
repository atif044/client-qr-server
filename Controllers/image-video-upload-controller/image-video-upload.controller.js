const db=require('../../database/db')
const ErrorHandler=require('../../config/ErrorHandler');
const catchAsyncErrors=require('../../config/catchAsyncErrors');
const {uploadaImageToCloudinary,uploadaVideoToCloudinary,deleteVideoFromCloudinary,deleteImageFromCloudinary}=require('../../Utils/uploadToCloudinary')
// Controller to upload image to cloudinary
exports.uploadImageToCloudinary=catchAsyncErrors(async(req,res,next)=>{
    const email=req.userData.user.email;
    const message=req.body.message;
    try {
        if(!req.file|| !req.file.mimetype.startsWith("image")){
            return next(new ErrorHandler("Please Upload Image Only",400));
        }
        let url=await uploadaImageToCloudinary(req.file.buffer);
        const result=await db.query('insert into media(email,datalink,mediatype,publicid,message) values (?,?,?,?,?)',[email,url.secure_url,"image",url.public_id,message]);
        if(result[0].affectedRows==1){
            return res.status(200).json({status:"success",message:"Image Uploaded Successfully"});
        }
        return next(new ErrorHandler("An error occurred",400))
    } catch (error) {
        return next(new ErrorHandler(error.message,error.code||error.statusCode));
    }
});
exports.uploadVideoToCloudinary=catchAsyncErrors(async(req,res,next)=>{
    const email=req.userData.user.email;
    const message=req.body.message;
    try {
        if(!req.file||!req.file.mimetype.startsWith("video")){
            return next(new ErrorHandler("Please Upload Video Only",400));
        }
    let url=await uploadaVideoToCloudinary(req.file.buffer)
    const result=await db.query('insert into media(email,datalink,mediatype,publicid,message) values (?,?,?,?,?)',[email,url.secure_url,"video",url.public_id,message]);
    if(result[0].affectedRows==1){
        return res.status(200).json({status:"success",message:"Video Uploaded Successfully"});
    }
    return next(new ErrorHandler("An error occurred",400))
        } 
         catch (error) {
    return next(new ErrorHandler(error.message,error.code||error.statusCode));
    }
});
exports.deleteImgFromCloudinary=catchAsyncErrors(async(req,res,next)=>{
    const {publicId}=req.body;
    const email=req.userData.user.email;
    try {
        await db.query("START TRANSACTION");
        let [rows,fields]=await db.query("Select * from media where publicid= ? and email = ?",[publicId,email])
        if(rows.length===0){
            await db.query("ROLLBACK");
            return next(new ErrorHandler("You can't delete other's image",400));
        }
        let response=await deleteImageFromCloudinary(publicId);
        let result=await db.query("delete from media where email = ? and publicid = ?",[email,publicId])
        await db.query("COMMIT");
        res.status(200).json({status:"success",message:"Image has been deleted"});
        

    } catch (error) {   
        await db.query("ROLLBACK")
        return next(new ErrorHandler(error.message,error.code||error.statusCode))
    }
});
exports.deleteFromCloudinary=catchAsyncErrors(async(req,res,next)=>{
    
    const {publicId}=req.body;
    const email=req.userData.user.email;
    try {
        await db.query("START TRANSACTION");
        let [rows,fields]=await db.query("Select * from media where publicid=? and email = ?",[publicId,email])
        if(rows.length===0){
            await db.query("ROLLBACK");
            return next(new ErrorHandler("You can't delete other's video",400));
        }
        let response=await deleteVideoFromCloudinary(publicId);
        let result=await db.query("delete from media where email = ? and publicid = ?",[email,publicId])
        await db.query("COMMIT");
        res.status(200).json({status:"success",message:"Video has been deleted"});
        

    } catch (error) {   
        await db.query("ROLLBACK")
        return next(new ErrorHandler(error.message,error.code||error.statusCode))
    }
});






exports.uploadPP=catchAsyncErrors(async(req,res,next)=>{
    const email=req.userData.user.email;
    try {
      let query=await db.query("Select * from users where email = ?",[email]);
      console.log(query[0][0].p_publicid)
      if(query[0][0].profilepic!==""){
        let response=await deleteImageFromCloudinary(query[0][0].p_publicid);
      }
      if(!req.file|| !req.file.mimetype.startsWith("image")){
        return next(new ErrorHandler("Please Upload Image Only",400));
    }
    let url=await uploadaImageToCloudinary(req.file.buffer);
    let result=await db.query("update users set profilepic = ? , p_publicid = ? where email = ?",[url.secure_url,url.public_id,email])
    if(result[0].affectedRows==1){
        return res.status(200).json({status:"success",message:"Image Uploaded Successfully"});
    }
    return next(new ErrorHandler("An error occurred",400))
      
  
      
    } catch (error) {
      return next(
        new ErrorHandler(error.message, error.code || error.statusCode)
      );
    }
  }
  )
  