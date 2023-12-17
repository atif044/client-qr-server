const ErrorHandler = require("../../config/ErrorHandler");
const catchAsyncErrors = require("../../config/catchAsyncErrors");
const db = require("../../database/db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
exports.makePayment = catchAsyncErrors(async (req, res, next) => {
  const email = req.userData.user.email;
  try {
    await db.query("START TRANSACTION");
    const { stripeToken, amount, shipping_address_id, shape, color, coupon } =
      req.body;
    const [rows, fields] = await db.query(
      "Select * from users where email = ?",
      [email]
    );
    if (rows[0].length === 0) {
      return next(new ErrorHandler("Please login Again", 400));
    }
    if (rows[0].paymentarrived === 1) {
      return next(new ErrorHandler("You Have already Paid for this one", 400));
    }

    const sql = "update users set paymentarrived = 1 where  email = ?";
    const values = [email];
    let result = await db.query(sql, values);
    const insertion = await db.query(
      "insert into qrcode_orders(shape,color,email,shipping_address_id) values (?,?,?,?)",
      [shape, color, email, shipping_address_id]
    );
    if (coupon !== "") {
      const query = await db.query(
        "insert into consignments (referreduser,referredby) values (?,?)",
        [email, coupon]
      );
    }
    const charge = await stripe.charges.create({
      amount: amount * 100,
      currency: "usd",
      description: "Payment for your qrcode",
      source: stripeToken,
    });
    if (charge.status !== "succeeded") {
      await db.query("Rollback");
      return next(new ErrorHandler("Error Processing Payment", 400));
    }
    await db.query("COMMIT");
    return res.status(200).json({
      status: "success",
      message: "Payment Successful. Admin will contact you soon",
    });
  } catch (error) {
    console.log(error);
    await db.query("ROLLBACK");
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});
exports.makePaymentMemoryFrame = catchAsyncErrors(async (req, res, next) => {
  const email = req.userData.user.email;
  try {
    await db.query("START TRANSACTION");
    const { stripeToken, amount, shipping_address_id, quantity, name, coupon } =
      req.body;
    const [rows, fields] = await db.query(
      "Select * from users where email = ?",
      [email]
    );

    const result = await db.query(
      "insert into orders(product_name,email,quantity,price,shipping_address_id) values(?,?,?,?,?)",
      [name, email, quantity, amount, shipping_address_id]
    );
    if (coupon !== "") {
      const query = await db.query(
        "insert into consignments (referreduser,referredby) values (?,?)",
        [email, coupon]
      );
    }
    const charge = await stripe.charges.create({
      amount: amount * 100 * quantity,
      currency: "usd",
      description: "Payment for your memory frame",
      source: stripeToken,
    });
    if (charge.status !== "succeeded") {
      await db.query("Rollback");
      return next(new ErrorHandler("Error Processing Payment", 400));
    }
    await db.query("COMMIT");
    return res
      .status(200)
      .json({ status: "success", message: "Order Placed Successfully" });
  } catch (error) {
    await db.query("ROLLBACK");
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});
// CONSIGNMENTS RELATED
exports.checkIfCouponValid = catchAsyncErrors(async (req, res, next) => {
  let coupon = req.body.coupon;
  let email = req.userData.user.email;
  try {
    let alreadyRefferedBySomeOne=await db.query("select * from consignments where referreduser = ?",[email]);
    if(alreadyRefferedBySomeOne[0].length>0){
      return next(new ErrorHandler("You have already been referred by some other user",400))
    }
    let result = await db.query(
      "select * from consignments where referredby = ? and referreduser = ?",
      [coupon, email]
    );
    if (result[0].length > 0) {
      return next(new ErrorHandler("You Have Already Used This", 400));
    }
    let query = await db.query("Select * from users where email = ?", [coupon]);
    if (query[0].length === 0) {
      return next(new ErrorHandler("Invalid!", 400));
    }
    if (coupon === email) {
      return next(new ErrorHandler("You cant use your referral code", 400));
    }
    return res.status(200).json({ status: "success", message: "Applied" });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});