const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || 'test',
  api_key: process.env.CLOUD_API_KEY || 'test',
  api_secret: process.env.CLOUD_API_SECRET || 'test',
});

module.exports = cloudinary;
