const express = require("express");
const verifyJwt = require("../middleware/verifyJwt");
const { checkIfLoggedIn } = require("../middleware/CheckIfAlreadyLoggedIN");
const { checkIfAdmin } = require("../middleware/CheckIfAdmin");
const utils = require("../Utils/uploadToCloudinary");
const validatorSignup = require("../Validators/signup.validator");
const ChangePwdValidator = require("../Validators/changepwd.validator");
const checker=require('../middleware/checker');
const {
  createAccount,
  loginAccount,
  changePassword,
  resetPassword,
  verifyResetPasswordToken,
  addShippingAddress,
  removeShippingAddress,
  MyProfile,
  fetchPhotos,
  fetchVideos,
  fetchShippingAddresses,
  fetchMyOrders,
  fethAllVideosAndImages,
  checkIfValidResetToken,
  fetchAllMessages,
  getProfilePic,
  addDates,
  fetchAllMessagesOfAuthenticatedUser,
  fetchDates,
  addNameOfTheDead,
  checkIfQrbought,
  getProfilePic1,
  getPricesOfTheProducts,
} = require("../Controllers/user-controller/user.controller");
const {
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
  deleteFromCloudinary,
  deleteImgFromCloudinary,
  uploadPP
} = require("../Controllers/image-video-upload-controller/image-video-upload.controller");
const {
  makePayment,
  makePaymentMemoryFrame,
  checkIfCouponValid,
  checkIfAlreadyReferred,
} = require("../Controllers/payment-controller/payment.controller");
const validatorLogin = require("../Validators/login.validator");
const shippingValidator = require("../Validators/shipping.validator");
const router = express.Router();
const { CountVideosAndImages } = require("../middleware/ImageAndVideoCount");
const {
  getAllMemoryFrameOrders,
  getAllQrOrders,
  getQrCodeOrderById,
  getMemoryFrameOrderById,
  getAllConsignments,
  changeToPaid,
  addMessage,
  removeMessage,
  getAllUsers,
  changeStatusOfTheQrOrder,
  changeStatusOfTheMemory,
  checkinstock,
  makeOutOfStock,
  getAllCoupons,
  addCoupon,
  removeCoupon,
  changePricing,
} = require("../Controllers/admin-controller/admin.controller");
router
  .route("/createaccount")
  .post(checkIfLoggedIn, validatorSignup, createAccount);
router
  .route("/loginaccount")
  .post(checkIfLoggedIn, validatorLogin, loginAccount);
router.route("/myProfile").get(verifyJwt, MyProfile);
router.route("/resetPassword").post(resetPassword);
router.route("/checkValidity/:token").post(checkIfValidResetToken);
router.route("/resetPassword/:token").post(verifyResetPasswordToken);
router
  .route("/changepassword")
  .post(verifyJwt, ChangePwdValidator, changePassword);
router
  .route("/addShippingDetail")
  .post(verifyJwt, shippingValidator, addShippingAddress);
router.route("/removeShippingDetail").post(verifyJwt, removeShippingAddress);
router
  .route("/uploadImage")
  .post(
    verifyJwt,
    utils.upload.single("image"),
    CountVideosAndImages,
    uploadImageToCloudinary
  );
router
  .route("/uploadVideo")
  .post(
    verifyJwt,
    utils.upload.single("video"),
    CountVideosAndImages,
    uploadVideoToCloudinary
  );
router.route("/fetchPhotos").get(verifyJwt, fetchPhotos);
router.route("/fetchVideos").get(verifyJwt, fetchVideos);
router.route("/fetchMyShippingAddress").get(verifyJwt, fetchShippingAddresses);
router.route("/myOrders").get(verifyJwt, fetchMyOrders);
router.route("/makePaymentQrCode").post(verifyJwt, makePayment);
router.route("/makePaymentMemoryFrame").post(verifyJwt, makePaymentMemoryFrame);
router.route("/deleteVideo").post(verifyJwt, deleteFromCloudinary);
router.route("/deleteImage").post(verifyJwt, deleteImgFromCloudinary);
router.route("/couponValidity").post(verifyJwt, checkIfCouponValid);

router.route("/getAll/:email").get(fethAllVideosAndImages);
router.route("/fetchAllMessage/:email").get(fetchAllMessages);
// ADMIN ROUTES
router
  .route("/getOrdersMemoryFrame")
  .get(verifyJwt, checkIfAdmin, getAllMemoryFrameOrders);
router.route("/getOrdersQrCode").get(verifyJwt, checkIfAdmin, getAllQrOrders);
router
  .route("/getOrdersQrCode/:id")
  .get(verifyJwt, checkIfAdmin, getQrCodeOrderById);
router
  .route("/getOrdersMemoryFrame/:id")
  .get(verifyJwt, checkIfAdmin, getMemoryFrameOrderById);
router
  .route("/getAllConsignments")
  .get(verifyJwt, checkIfAdmin, getAllConsignments);
router.route("/changeToPaid/:id").get(verifyJwt, checkIfAdmin, changeToPaid);
router.route("/checkIfAlreadyReferred").get(verifyJwt, checkIfAlreadyReferred);
router.route("/addMessage").post(verifyJwt, addMessage);
router.route("/deleteMessage").post(verifyJwt,removeMessage);
router.route("/getAllUsers").get(getAllUsers);
router.route("/uploadPP").post(verifyJwt,utils.upload.single("profile"),uploadPP);
router.route("/getPP/:email").get(getProfilePic);
router.route("/getPPP/:email").get(getProfilePic1);
router.route("/addDates").post(verifyJwt,addDates);
router.route("/getAllMessages").get(verifyJwt,fetchAllMessagesOfAuthenticatedUser);
router.route("/fetchDates").get(verifyJwt,fetchDates);
router.route("/addName").post(verifyJwt,addNameOfTheDead);
router.route("/changeStatusQrCode").post(verifyJwt,checkIfAdmin,changeStatusOfTheQrOrder);
router.route("/changeStatusMemory").post(verifyJwt,checkIfAdmin,changeStatusOfTheMemory);
router.route("/checkstock").get(checkinstock);
router.route("/changeStock").post(verifyJwt,checkIfAdmin,makeOutOfStock);
router.route("/getAllCoupons").get(verifyJwt,checkIfAdmin,getAllCoupons);
router.route("/createCoupon").post(verifyJwt,checkIfAdmin,addCoupon);
router.route("/removeCoupon").post(verifyJwt,checkIfAdmin,removeCoupon);
router.route("/checkqrbought").get(verifyJwt,checkIfQrbought);
router.route("/getPrice").get(getPricesOfTheProducts);
router.route("/changePricing").post(verifyJwt,checkIfAdmin,changePricing);
module.exports = router;