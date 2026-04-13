const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

async function checkRecent() {
  await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
  const tenMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  const props = await Property.find({ createdAt: { $gte: tenMinsAgo } });
  
  if (props.length === 0) {
    console.log("No new properties created in the last 30mins.");
  }

  for(let p of props) {
    console.log(`NEW PROP: ${p.title} | Area: ${p.location?.area} | Active: ${p.isActive}`);
    console.log(`Coords Array:`, p.location?.coordinates?.coordinates);
    console.log(`Google Link:`, p.location?.googleMapLink);
  }
  process.exit();
}
checkRecent();
