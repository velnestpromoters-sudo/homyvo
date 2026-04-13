const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

async function testGeo() {
  await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
  try {
    const lat = 11.0168; // Coimbatore
    const lng = 76.9558;
    console.log("Testing Geo Search...");
    const results = await Property.find({
      isActive: true,
      "location.coordinates": {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 50000 // 50km
        }
      }
    });
    console.log("Results found:", results.length);
  } catch (err) {
    console.error("GEO ERROR:", err);
  }
  process.exit(0);
}

testGeo();
