const db = require("../../database/db");
const catchAsyncErrors = require("../../config/catchAsyncErrors");
const ErrorHandler = require("../../config/ErrorHandler");
const generateJwt = require("././../../Utils/generateJwt");
const { hash, compare } = require("bcrypt");
const { sendEmail } = require("../email-controller/email.main.controller");
const qr = require("qrcode");
const { generateToken } = require("../../Utils/generateToken");
exports.createAccount = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    await db.query("START TRANSACTION");
    const [rows, fields] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (rows.length > 0) {
      return next(new ErrorHandler("Email is already taken", 400));
    }
    const hashedPass = await hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (name, email, password,paymentarrived) VALUES (?, ?, ?,?)",
      [name, email, hashedPass, 0]
    );
    await db.query("COMMIT");
    res
      .status(200)
      .json({
        status: "success",
        message: "User registered successfully",
        result,
      });
  } catch (error) {
    await db.query("ROLLBACK");
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.loginAccount = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const [rows, fields] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return next(new ErrorHandler("Email or Password is Incorrect", 400));
    }
    let passwordCompare = await compare(password, rows[0].Password);
    if (!passwordCompare) {
      return next(new ErrorHandler("Email or Password is Incorrect", 400));
    }
    const data = {
      user: {
        id: rows[0].id,
        fullName: rows[0].Name,
        email: rows[0].Email,
        admin: rows[0].isAdmin,
      },
    };
    const authToken = generateJwt(data);
    res.cookie("rememberedAlways", authToken, {
      secure: false, // You're not on HTTPS, so this should be false
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.cookie("admin", rows[0].isAdmin, {
      secure: false, // You're not on HTTPS, so this should be false
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      body: data,
      token: authToken,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const email = req.userData.user.email;
  try {
    let [rows, fields] = await db.query("select * from users where email= ?", [
      email,
    ]);
    if (rows.length === 0) {
      return next(
        new ErrorHandler(
          "Your Account doesnt exist. Please make a new Account",
          400
        )
      );
    }
    const oldPwdCompare = await compare(oldPassword, rows[0].Password);
    if (!oldPwdCompare) {
      return next(new ErrorHandler("Old Password is Incorrect", 400));
    }
    if (oldPassword === newPassword) {
      return next(
        new ErrorHandler("New Password can not be same as old password", 400)
      );
    }
    const hashed = await hash(newPassword, 10);
    const results = await db.query(
      "Update users set password = ? where email = ?",
      [hashed, email]
    );
    if (results[0].affectedRows === 1) {
      return res
        .status(200)
        .json({ status: "success", message: "Password changed Successfully" });
    }
    return next(new ErrorHandler("An Error Occurred", 400));
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const email = req.body.email;
  try {
    await db.query("START TRANSACTION");
    let [rows, fields] = await db.query("Select * from users where email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      await db.query("ROLLBACK");
      return next(new ErrorHandler("Account Doesn't Exist", 400));
    }
    let searchIfAlreadyRequested = await db.query(
      "Select * from resetpasswordtokens where email = ?",
      email
    );
    if (searchIfAlreadyRequested[0].length >= 1) {
      let isDeleted = await db.query(
        "Delete from resetpasswordtokens where email = ?",
        email
      );
      if (isDeleted[0].affectedRows === 0) {
        await db.query("ROLLBACK");
        return next(new ErrorHandler("An Error Occured", 400));
      }
    }
    let resetToken = generateToken(5);
    let result = await db.query(
      "Insert into resetpasswordtokens(email,tokenvalue) values(?,?)",
      [email, resetToken]
    );
    if (result[0].affectedRows === 0) {
      await db.query("ROLLBACK");
      return next(
        new ErrorHandler("An Error Occurred please try again later", 400)
      );
    }
    await sendEmail(
      email,
      "Password Reset Link",
      `Open the link to reset your password ${process.env.WEBSITE_ADDRESS}/resetPass/remembered-always/${resetToken}`
    );
    await db.query("COMMIT");
    res
      .status(200)
      .json({
        status: "success",
        message: "Verifcation Code is Sent to Your Email",
      });
  } catch (error) {
    await db.query("ROLLBACK");

    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.verifyResetPasswordToken = catchAsyncErrors(async (req, res, next) => {
  let token = req.params.token;
  let newPassword = req.body.newPassword;
  try {
    await db.query("START TRANSACTION");
    let result = await db.query(
      "select * from resetpasswordtokens where tokenvalue =?",
      [token]
    );
    if (
      result[0].length === 0 ||
      Date.now() > result[0][0]?.created_at + 60 * 60 * 1000
    ) {
      await db.query("ROLLBACK");
      return next(
        new ErrorHandler("Code is either invalid or has expired", 400)
      );
    }
    let hashedPassword = await hash(newPassword, 10);
    let changedPassword = await db.query(
      "Update users set password = ? where email = ?",
      [hashedPassword, result[0][0].email]
    );
    if (changedPassword[0].affectedRows === 0) {
      await db.query("ROLLBACK");
      return next(new ErrorHandler("An Error Occurred", 400));
    }
    await db.query("DELETE FROM resetpasswordtokens where tokenvalue = ?", [
      token,
    ]);
    await db.query("COMMIT");

    res
      .status(200)
      .json({
        status: "success",
        message: "Password has been changed successfully",
      });
  } catch (error) {
    await db.query("ROLLBACK");
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});

exports.checkIfValidResetToken = catchAsyncErrors(async (req, res, next) => {
  let token = req.params.token;
  try {
    await db.query("START TRANSACTION");
    let result = await db.query(
      "select * from resetpasswordtokens where tokenvalue =?",
      [token]
    );
    if (
      result[0].length === 0 ||
      Date.now() > result[0][0]?.created_at + 60 * 60 * 1000
    ) {
      await db.query("ROLLBACK");
      return next(
        new ErrorHandler("Code is either invalid or has expired", 400)
      );
    }
    return res.status(200).json({ status: "success", message: "Valid" });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});

exports.addShippingAddress = catchAsyncErrors(async (req, res, next) => {
  let { country, city, address1, address2, phoneNo, dataEmail } = req.body;
  let email = req.userData.user.email;
  try {
    let query = await db.query(
      "select count(Country) as 'count' from shipping_address where email = ?",
      [email]
    );
    if (query[0][0].count == 3) {
      return next(new ErrorHandler("Can't Add More than 3 Addresses", 400));
    }
    let result = await db.query(
      "insert into shipping_address(Country,City,Address1,Address2,phoneNo,email,userChoiceEmail) values (?,?,?,?,?,?,?)",
      [country, city, address1, address2, phoneNo, email, dataEmail]
    );
    if (result[0].affectedRows === 0) {
      return next(new ErrorHandler("An Error Occurred", 400));
    }
    res
      .status(201)
      .json({
        status: "success",
        message: "Shipping Address Added Successfully",
      });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.removeShippingAddress = catchAsyncErrors(async (req, res, next) => {
  let { id } = req.body;
  let email = req.userData.user.email;
  try {
    let result = await db.query(
      "delete from shipping_address where id= ? and email = ?",
      [id, email]
    );
    if (result[0].affectedRows === 0) {
      return next(new ErrorHandler("An Error Occurred", 400));
    }
    res
      .status(201)
      .json({
        status: "success",
        message: "Shipping Address removed Successfully",
      });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return next(
        new ErrorHandler(
          "You have an existing order on this id! You can't delete it",
          400
        )
      );
    }
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.MyProfile = catchAsyncErrors(async (req, res, next) => {
  const email = req.userData.user.email;
  try {
    let result = await db.query("Select * from users where email = ?", [email]);
    let shippingAddresses = await db.query(
      "Select * from shipping_address where email = ?",
      [email]
    );
    let Data = {
      name: result[0][0].Name,
      email: result[0][0].Email,
      shipping: shippingAddresses[0],
      dob:result[0][0].dob,
      dod:result[0][0].dod
    };
    res.status(200).json({ status: "success", body: Data });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.fetchPhotos = catchAsyncErrors(async (req, res, next) => {
  const type = "image";
  let email = req.userData.user.email;
  try {
    let result = await db.query(
      "select * from media where email = ? and mediatype = ?",
      [email, type]
    );
    if (result[0].length === 0) {
      return next(new ErrorHandler("No Images to display"));
    }
    let dataLink = result[0].map(({ datalink, publicid,message }) => ({
      datalink: datalink,
      publicid: publicid,
      message : message
    }));
    return res
      .status(200)
      .json({ status: "success", message: "Images found", body: dataLink,email:email});
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.fetchVideos = catchAsyncErrors(async (req, res, next) => {
  const type = "video";
  let email = req.userData.user.email;
  try {
    let result = await db.query(
      "select * from media where email = ? and mediatype = ?",
      [email, type]
    );
    if (result[0].length === 0) {
      return next(new ErrorHandler("No Videos to display"));
    }
    let dataLink = result[0].map(({ datalink, publicid,message }) => ({
      datalink: datalink,
      publicid: publicid,
      message:message
    }));
    return res
      .status(200)
      .json({ status: "success", message: "Videos found", body: dataLink });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.fetchShippingAddresses = catchAsyncErrors(async (req, res, next) => {
  let email = req.userData.user.email;
  try {
    let result = await db.query(
      "Select * from shipping_address where email = ?",
      [email]
    );
    if (result[0].length === 0) {
      return next(
        new ErrorHandler("No Shipping Address Found. Add One Please", 400)
      );
    }
    return res
      .status(200)
      .json({
        status: "success",
        message: "Shipping Addresses",
        body: result[0],
      });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.fetchMyOrders = catchAsyncErrors(async (req, res, next) => {
  let email = req.userData.user.email;
  try {
    let result = await db.query("Select * from orders where email = ?", [
      email,
    ]);
    let result2 = await db.query(
      "select * from qrcode_orders where email = ?",
      [email]
    );
    let body = result[0].concat(result2[0]);

    return res
      .status(200)
      .json({ status: "success", message: "My Confirmed Orders", body: body });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.fethAllVideosAndImages = catchAsyncErrors(async (req, res, next) => {
  try {
    let email = req.params.email;
    let result = await db.query(
      "Select paymentarrived from users where email = ?",
      [email]
    );
    if (result[0].length === 0) {
      return next(new ErrorHandler("Account doesn't exist", 400));
    } else if (result[0][0].paymentarrived === 0) {
      return next(new ErrorHandler("Please Pay to active your qr code", 400));
    }
    let query=await db.query("Select * from users where email = ?",[email]);

    let videos = await db.query(
      "select * from media where email = ? and mediatype = ? ",
      [email, "video"]
    );
    let images = await db.query(
      "select * from media where email = ? and mediatype = ? ",
      [email, "image"]
    );

    return res.status(200).json({
      status: "success",
      message: "Images and Videos Fetched Successfully",
      body: {
        videos: videos[0].map(({ datalink,message}) => ({datalink:datalink,message:message})),
        images: images[0].map(({ datalink,message }) => ({datalink:datalink,message:message})),
      },
      name:query[0][0].dead_name,
      dob:query[0][0].dob,
      dod:query[0][0].dod
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});

exports.fetchAllMessages = catchAsyncErrors(async (req, res, next) => {
  const email = req.params.email;
  try {
    let query = await db.query(
      "select message from messages where useremail = ? ",
      [email]
    );
    if (query[0].length === 0) {
      return next(new ErrorHandler("No Messages Added", 404));
    }
    return res.status(200).json({
      status: "success",
      message: "Messages Fetched Successfully",
      body: query[0],
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.fetchAllMessagesOfAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const email = req.userData.user.email;
  try {
    let query = await db.query(
      "select * from messages where useremail = ? ",
      [email]
    );
    if (query[0].length === 0) {
      return next(new ErrorHandler("No Messages Added", 404));
    }
    return res.status(200).json({
      status: "success",
      message: "Messages Fetched Successfully",
      body: query[0],
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});

exports.getProfilePic=catchAsyncErrors(async(req,res,next)=>{
  const email=req.params.email;
  try {
    let query=await db.query("Select * from users where email = ?",[email]);
    return res.status(200).json(
      {
        status:"success",
      body:query[0][0].profilepic});
    
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
})

exports.addDates=catchAsyncErrors(async(req,res,next)=>{
  let email=req.userData.user.email;
  let dob=req.body.dob;
  let dod=req.body.dod;
  try {
    let response=await db.query("update users set dob = ?, dod = ? where email = ? ",[dob,dod,email]);
    if(response[0].affectedRows===1){
      return res.status(200).json({
        status:"success",
        message:"added successfully"
      })
    }
    return next(new ErrorHandler("Somethin Went Wrong",400));
    
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
})

exports.fetchDates=catchAsyncErrors(async(req,res,next)=>{
  let email=req.userData.user.email;
  try {
    let result=await db.query("Select * from users where email = ?",[email]);
          return res.status(200).json({
            status:"success",
            message:"dates fetched successfully",
            body:{
              dob:result[0][0].dob||"",
              dod:result[0][0].dod||"",
              deadName:result[0][0].dead_name
            }
          })
    
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  }
});
exports.addNameOfTheDead=catchAsyncErrors(
  async(req,res,next)=>{
    const email=req.userData.user.email;
    const name=req.body.name
    try {
      let query=await db.query("update users set dead_name= ? where email = ?",[name,email]);
      if(query[0].affectedRows===1){
        return res.status(200).json({
          status:"success",
          message:"successfully added"
        });
      }
      return next(new ErrorHandler("Error Occured",400))
    } catch (error) {
      return next(
        new ErrorHandler(error.message, error.code || error.statusCode)
      );
    }
  }
)
