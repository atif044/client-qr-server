const { cloudinaryConfig, uploader,api } = require('../config/cloudinaryConfig');
const multer=require('multer');
const ErrorHandler=require("../config/ErrorHandler")
const storage = multer.memoryStorage();
exports.upload = multer({ storage: storage });
cloudinaryConfig();
exports.uploadaVideoToCloudinary = (imageBuffer) => {
    return new Promise((resolve, reject) => {
      uploader.upload_stream({ resource_type: 'video' }, (error, result) => {
        if (error) {
          reject(new ErrorHandler("Error Uploading", 400));
        } else {
          // Cloudinary returns the uploaded image URL in the result
          resolve(result);
        }
      }).end(imageBuffer); // Upload the processed image buffer
    });
  };
exports.uploadaImageToCloudinary = (imageBuffer) => {
    return new Promise((resolve, reject) => {
      uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) {
          reject(new ErrorHandler("Error Uploading", 400));
        } else {
          // Cloudinary returns the uploaded image URL in the result
                    resolve(result);
        }
      }).end(imageBuffer); // Upload the processed image buffer
    });
  };
exports.deleteVideoFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
      uploader.destroy(publicId,{resource_type:"video",invalidate:true}, (error, result) => {
      if (error) {
      reject (error)
      } else {
        if(result.result==='not found'){
          reject({message:"Not Found",code:404})
        }
        else{
          resolve(result);
        }
      }
    });
  });
};
exports.deleteImageFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    uploader.destroy(publicId, { resource_type: "image",invalidate:true }, (error, result) => {
      if (error) {
      reject (error)
      } else {
        if(result.result==='not found'){
          reject({message:"Not Found",code:404})
        }
        else{
          resolve(result);
        }
      }
    });
  });
};