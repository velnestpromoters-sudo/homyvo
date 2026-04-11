const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.uploadToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'image',
    folder: 'bnest/properties',
  });

  fs.unlinkSync(filePath); // Cleanup local temp file
  return result.secure_url;
};

exports.deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary deletion failed for:", publicId, err);
  }
};
