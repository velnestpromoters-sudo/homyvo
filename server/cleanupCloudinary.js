require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('./config/cloudinary');
const Property = require('./models/Property');
const connectDB = require('./config/db');

async function cleanupCloudinary() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Fetching all properties from database...');
    const properties = await Property.find({}, 'images');
    
    // Extract public IDs of all images in DB
    const dbImagesSet = new Set();
    properties.forEach(prop => {
      prop.images.forEach(imageUrl => {
        // Extract public ID from Cloudinary URL
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567/bnest/properties/sample.jpg
        // Public ID is bnest/properties/sample
        
        try {
          // If it's just a public ID or local path, this might need handling,
          // but we expect Cloudinary URLs here.
          if (!imageUrl.includes('cloudinary.com')) {
              // Just in case there are non-Cloudinary images
              return;
          }

          const urlParts = imageUrl.split('/');
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          if (uploadIndex !== -1) {
            const pathWithVersion = urlParts.slice(uploadIndex + 1).join('/');
            const versionIndex = pathWithVersion.indexOf('/');
            let publicIdWithExtension = pathWithVersion.substring(versionIndex + 1);
            
            // Remove extension
            const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
            const publicId = lastDotIndex !== -1 ? publicIdWithExtension.substring(0, lastDotIndex) : publicIdWithExtension;
            
            dbImagesSet.add(publicId);
          }
        } catch (e) {
          console.error(`Error parsing URL: ${imageUrl}`, e);
        }
      });
    });

    console.log(`Found ${dbImagesSet.size} unique images attached to properties in the DB.`);

    // Fetch all images from Cloudinary in the bnest/properties folder
    console.log('Fetching images from Cloudinary folder "bnest/properties"...');
    let cloudinaryImages = [];
    let nextCursor = null;

    do {
      const response = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'bnest/properties/', // Folder prefix
        max_results: 500,
        next_cursor: nextCursor,
      });

      cloudinaryImages = cloudinaryImages.concat(response.resources);
      nextCursor = response.next_cursor;
    } while (nextCursor);

    console.log(`Found ${cloudinaryImages.length} total images in Cloudinary.`);

    // Compare and find orphans
    const orphanedImages = [];
    for (const image of cloudinaryImages) {
      if (!dbImagesSet.has(image.public_id)) {
        orphanedImages.push(image.public_id);
      }
    }

    console.log(`Found ${orphanedImages.length} orphaned images in Cloudinary.`);

    if (orphanedImages.length > 0) {
      console.log('Orphaned images to be deleted:');
      orphanedImages.forEach(id => console.log(id));

      console.log('Starting deletion process...');
      for (const publicId of orphanedImages) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted: ${publicId}`);
        } catch (err) {
          console.error(`Failed to delete: ${publicId}`, err);
        }
      }
      console.log('Deletion complete.');
    } else {
      console.log('No orphaned images found. Nothing to delete.');
    }

  } catch (error) {
    console.error('Error during cleanup process:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

cleanupCloudinary();
