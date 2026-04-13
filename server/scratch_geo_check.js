const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
  const props = await Property.find({ isActive: true });
  
  for(let p of props) {
    console.log(`Title: ${p.title}`);
    console.log(`Link: ${p.location?.googleMapLink}`);
    console.log(`Coords: ${JSON.stringify(p.location?.coordinates?.coordinates)}`);
    console.log("----------------------");
  }
  process.exit();
}
run();
