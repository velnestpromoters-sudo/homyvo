const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

const AREA_COORDINATES = {
  // Key: lowercase area name, Value: { lat, lng, radius in km }
  "kalapatti": { lat: 11.063, lng: 77.040, radius: 4 },
  "peelamedu": { lat: 11.026, lng: 77.005, radius: 4 },
  "airport": { lat: 11.030, lng: 77.043, radius: 4 },
  "saravanampatti": { lat: 11.082, lng: 76.995, radius: 4 },
  "thudiyalur": { lat: 11.085, lng: 76.938, radius: 4 },
  "rs puram": { lat: 11.011, lng: 76.947, radius: 4 },
  "vada valli": { lat: 11.027, lng: 76.902, radius: 4 },
  "singanallur": { lat: 10.999, lng: 77.026, radius: 4 },
};

async function testCoordinateSearch(searchString) {
  await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
  
  const qStr = searchString.toLowerCase();
  let query = { isActive: true };
  
  // 1. Location Matching Phase
  let detectedArea = null;
  for (const [area, coords] of Object.entries(AREA_COORDINATES)) {
      if (qStr.includes(area)) {
          detectedArea = { name: area, ...coords };
          break;
      }
  }

  // Fallback to "kallapatti" typo
  if (!detectedArea && qStr.includes("kallapatti")) detectedArea = { name: "kalapatti", ...AREA_COORDINATES["kalapatti"] };

  if (detectedArea) {
      console.log(`Detected Location: ${detectedArea.name}. Using strict GPS bounds.`);
      query["location.coordinates"] = {
        $near: {
          $geometry: { type: "Point", coordinates: [detectedArea.lng, detectedArea.lat] },
          $maxDistance: detectedArea.radius * 1000 // meters
        }
      };
  }

  // 2. Feature Filtering Phase
  if (qStr.match(/\bpg\b|\bboys\b|\bgirls\b/)) { query.propertyType = 'pg'; }
  if (qStr.match(/\bboys\b/)) { query["pgDetails.gender"] = 'boys'; }
  if (qStr.match(/\bgirls\b/)) { query["pgDetails.gender"] = 'girls'; }
  
  const props = await Property.find(query);
  console.log(`\nResults for "${searchString}": ${props.length}`);
  for(let p of props) {
      console.log(`- ${p.title} (${p.propertyType || 'apartment'}) Area: ${p.location?.area}`);
  }
  process.exit();
}

testCoordinateSearch("kalapatti boys pg");
