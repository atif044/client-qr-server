const db = require("../../database/db");
const catchAsyncErrors = require("../../config/catchAsyncErrors");
const ErrorHandler = require("../../config/ErrorHandler");
exports.getAllMemoryFrameOrders=catchAsyncErrors(async(req,res,next)=>{
    try {
        // select qro.id as 'order_id', qro.*,sa.*,sa.id as 'sa_id' from qrcode_orders qro left join shipping_address sa ON QRO.shipping_address_id=SA.id;
        let result=await db.query("select *, o.id as 'order_id' from orders o join shipping_address sa ON o.shipping_address_id=sa.id where o.status = ? order by o.Time desc;",["delivered"]);
        let result1=await db.query("select *, o.id as 'order_id' from orders o join shipping_address sa ON o.shipping_address_id=sa.id where o.status = ? order by o.Time desc;",["shipping"]);
        let result2=await db.query("select *, o.id as 'order_id' from orders o join shipping_address sa ON o.shipping_address_id=sa.id where o.status = ? order by o.Time desc;",["In Transit"]);
        
        if(result[0].length===0&&result1.length===0 && result2.length===0){
            return next(new ErrorHandler("No Order Placed Yet",400));
        }
                 
        return res.status(200).json({status:"success",message:"Memory Frame Orders fetched!",body:{
            delivered:result[0],
            shipping:result1[0],
            transit:result2[0],
        }});
         
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.getAllQrOrders=catchAsyncErrors(async(req,res,next)=>{
    try {
        let result=await db.query("SELECT u.id AS 'userid', qro.id AS 'order_id', qro.*, sa.*, sa.id AS 'sa_id' FROM qrcode_orders qro LEFT JOIN shipping_address sa ON qro.shipping_address_id = sa.id JOIN users u ON u.Email = sa.email WHERE qro.status = ?  ORDER BY qro.`Time` DESC;",["delivered"]);
        let result2=await db.query("SELECT u.id AS 'userid', qro.id AS 'order_id', qro.*, sa.*, sa.id AS 'sa_id' FROM qrcode_orders qro LEFT JOIN shipping_address sa ON qro.shipping_address_id = sa.id JOIN users u ON u.Email = sa.email WHERE qro.status = ?  ORDER BY qro.`Time` DESC;",["shipping"]);
        let result3=await db.query("SELECT u.id AS 'userid', qro.id AS 'order_id', qro.*, sa.*, sa.id AS 'sa_id' FROM qrcode_orders qro LEFT JOIN shipping_address sa ON qro.shipping_address_id = sa.id JOIN users u ON u.Email = sa.email WHERE qro.status = ?  ORDER BY qro.`Time` DESC;",["In Transit"]);
        if(result[0].length===0 &&result2.length===0 && result3.length===0){
            return next(new ErrorHandler("No Order Placed Yet",400));
        }
        return res.status(200).json({status:"success",message:"Qr Orders fetched!",body:{
            shipping:result2[0],
            delivered:result[0],
            transit:result3[0],
        }});
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.getQrCodeOrderById=catchAsyncErrors(async(req,res,next)=>{
    let id=req.params.id
    try {
        let result=await db.query("select *, qro.id as 'order_id' from qrcode_orders qro join shipping_address sa ON qro.shipping_address_id=sa.id join users u on qro.email=u.Email where qro.id = ?",[id]);
        
        if(result[0].length===0){
            return next(new ErrorHandler("not found",404));
        }
        return res.status(200).json({status:"success",message:"Qr Order fetched!",body:result[0]});
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.getMemoryFrameOrderById=catchAsyncErrors(async(req,res,next)=>{
    let id=req.params.id
    try {
        let result=await db.query("select *, o.id as 'order_id' from orders o join shipping_address sa ON o.shipping_address_id=sa.id join users u on o.email=u.Email where o.id = ?",[id]);
        
        if(result[0].length===0){
            return next(new ErrorHandler("not found",404));
        }
        return res.status(200).json({status:"success",message:"Order fetched!",body:result[0]});
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.getAllConsignments=catchAsyncErrors(async(req,res,next)=>{
    try {
        let result=await db.query("Select * from consignments where ispaid = ?",[0]);
        return res.status(200).json({status:"success",message:"All Consignments fetched",body:result[0]})
        
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.changeToPaid=catchAsyncErrors(async(req,res,next)=>{
    let id=req.params.id;
     id=parseInt(id)
    if(isNaN(id)){
        return next(new ErrorHandler("No Such consignment Found",404));
    }
    try {
        let result=await db.query("update consignments set ispaid = ? where id = ?",[1,id]);
        if(result[0].length===0){
            return next(new ErrorHandler("No Such consignment Found",404));
        }
        return res.status(200).json({status:"success",message:"Changed To Paid"});
         
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.getAllUsers=catchAsyncErrors(async(req,res,next)=>{
    try {
        let result=await db.query("select Email from users where paymentarrived = ?",[1]);
        if(result[0].length===0){
            return next("No User Found",404);
        }
        return res.status(200).json(
            {
                status:"success",
                message:"All Users Fetched",
                body:result[0]
            }
        )

        } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.addMessage=catchAsyncErrors(async(req,res,next)=>{
    let email=req.userData.user.email;
    let message=req.body.message;
    try {
        let query=await db.query("Select * from users where email = ?",[email]);
        if(query[0].length===0){
            return next(new ErrorHandler("No Such Account Found",400));
        }
        else if(query[0][0].paymentarrived===0){
            return next(new ErrorHandler("This user hasn't bought the Qr",400));
        }
        let result=await db.query("insert into messages(message,useremail) values (?,?)",[message,email]);
        return res.status(201).json({
            status:"success",
            message:"Message for Corresponding User Added",
            email:email
        })
        
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.removeMessage=catchAsyncErrors(async(req,res,next)=>{
    try {
    let id=req.body.id;
    let email=req.userData.user.email;

    let query=await db.query("Select * from messages where useremail = ? and id = ?",[email,id]);
    if(query[0].length===0){
        return next(new ErrorHandler("This Message Doesnt Belongs to you",400));
    }
    let result=await db.query("delete from messages where id = ?",[id]);
    return res.status(200).json({
        status:"success",
        message:"Deleted Successfully"
    });
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.changeStatusOfTheQrOrder=catchAsyncErrors(async(req,res,next)=>{
    let status=req.body.status;
    let email=req.body.email;
    let id=req.body.id
    if(status!=="In Transit" && status!=="shipping" && status!=="delivered"){
        return next(new ErrorHandler("No Such status",400))
    }
    try {
        let query=await db.query("update qrcode_orders set status = ? where email = ? and id = ?",[status,email,id]);
        return res.status(200).json({
            status:"success",
            message:"status Changed"
        })
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.changeStatusOfTheMemory=catchAsyncErrors(async(req,res,next)=>{
    let status=req.body.status;
    let email=req.body.email;
    let id=req.body.id
    if(status!=="In Transit" && status!=="shipping" && status!=="delivered"){
        return next(new ErrorHandler("No Such status",400))
    }
    try {
        let query=await db.query("update orders set status = ? where email = ? and id = ?",[status,email,id]);
        return res.status(200).json({
            status:"success",
            message:"status Changed"
        })
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.makeOutOfStock=catchAsyncErrors(async(req,res,next)=>{
    let value=req.body.status;
   
    try {
        if(value==="n"){
            let result=await db.query("update checkstock set checkinStock = ?  where id = ? ",[0,1])
        }
        else{
            let result=await db.query("update checkstock set checkinStock = ?  where id = ? ",[1,1])
        }
        return res.status(200).json({
            status:"success",
            message:"status changed"
        });
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    
    }
});
exports.checkinstock=catchAsyncErrors(async(req,res,next)=>{
    try {
        let result=await db.query("Select * from checkstock where id = ?",[1]);
        return res.status(200).json({
            status:"success",
            body:result[0][0].checkinStock
        });
        
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.addCoupon=catchAsyncErrors(async(req,res,next)=>{
    let coupon=req.body.coupon;
    let discount=req.body.discount
    try {
        let result=await db.query("select * from coupon where coupon = ?",[coupon]);
        if(result[0].length===1){
            return next(new ErrorHandler("A Coupon with this Code Already exist's",400));
        }
        let query=await db.query("insert into coupon (coupon,discount) values(?,?)",[coupon,discount]);
        return res.status(200).json({
            status:"success",
            message:"Coupon Code Added Successfully"
        });

        
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.removeCoupon=catchAsyncErrors(async(req,res,next)=>{
    let coupon=req.body.coupon;
    try {
        let result=await db.query("select * from coupon where coupon = ?",[coupon]);
        if(result[0].length===1){
            let query=await db.query("delete from coupon where coupon = ?",[coupon]);
            return res.status(200).json({
                status:"success",
                message:"Coupon Removed Successfully"
            })
        }
        return next(new ErrorHandler("No Such Coupon Exist",400));
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.getAllCoupons=catchAsyncErrors(async(req,res,next)=>{
    try {
        const query=await db.query("select * from coupon");
        return res.status(200).json({
            status:"success",
            message:"Fetched Successfully",
            body:query[0]
        });
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
