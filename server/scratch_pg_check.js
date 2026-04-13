const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

async function checkPg() {
  await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
  const props = await Property.find({ isActive: true });
  for(let p of props) {
    console.log(`Type: ${p.propertyType} | Gender: ${p.pgDetails?.gender}`);
  }
  process.exit();
}
checkPg();
