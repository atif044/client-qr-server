const db = require("../../database/db");
const catchAsyncErrors = require("../../config/catchAsyncErrors");
const ErrorHandler = require("../../config/ErrorHandler");
exports.getAllMemoryFrameOrders=catchAsyncErrors(async(req,res,next)=>{
    try {


        // select qro.id as 'order_id', qro.*,sa.*,sa.id as 'sa_id' from qrcode_orders qro left join shipping_address sa ON QRO.shipping_address_id=SA.id;
        let result=await db.query("select *, o.id as 'order_id' from orders o join shipping_address sa ON o.shipping_address_id=SA.id;");
        if(result[0].length===0){
            return next(new ErrorHandler("No Order Placed Yet",400));
        }
        return res.status(200).json({status:"success",message:"Memory Frame Orders fetched!",body:result[0]});
         
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.getAllQrOrders=catchAsyncErrors(async(req,res,next)=>{
    try {
        let result=await db.query("select qro.id as 'order_id', qro.*,sa.*,sa.id as 'sa_id' from qrcode_orders qro left join shipping_address sa ON QRO.shipping_address_id=SA.id;");
        if(result[0].length===0){
            return next(new ErrorHandler("No Order Placed Yet",400));
        }
        return res.status(200).json({status:"success",message:"Qr Orders fetched!",body:result[0]});
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
});
exports.getQrCodeOrderById=catchAsyncErrors(async(req,res,next)=>{
    let id=req.params.id
    try {
        let result=await db.query("select *, qro.id as 'order_id' from qrcode_orders qro join shipping_address sa ON QRO.shipping_address_id=SA.id join users u on qro.email=u.Email where QRO.id = ?",[id]);
        
        if(result[0].length===0){
            return next(new ErrorHandler("not found",404));
        }
        return res.status(200).json({status:"success",message:"Qr Order fetched!",body:result[0]});
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
})
exports.getMemoryFrameOrderById=catchAsyncErrors(async(req,res,next)=>{
    let id=req.params.id
    try {
        let result=await db.query("select *, o.id as 'order_id' from orders o join shipping_address sa ON o.shipping_address_id=SA.id join users u on o.email=u.Email where o.id = ?",[id]);
        
        if(result[0].length===0){
            return next(new ErrorHandler("not found",404));
        }
        return res.status(200).json({status:"success",message:"Order fetched!",body:result[0]});
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
})
exports.getAllConsignments=catchAsyncErrors(async(req,res,next)=>{
    try {
        let result=await db.query("Select * from consignments where ispaid = ?",[0]);
        return res.status(200).json({status:"success",message:"All Consignments fetched",body:result[0]})
        
    } catch (error) {
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
})
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
        console.log(error)
        return next(
            new ErrorHandler(error.message, error.code || error.statusCode)
          );
    }
})