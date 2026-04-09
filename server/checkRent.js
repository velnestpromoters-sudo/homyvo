const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config({ path: './.env' });

async function checkRent() {
  await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
  const badProps = await Property.find({ rent: { $exists: false } });
  console.log(`PROPERTIES WITHOUT RENT: ${badProps.length}`);
  
  if (badProps.length > 0) {
    console.log("Sample:", badProps[0].title);
  }

  const badTypes = await Property.find({ propertyType: { $exists: false } });
  console.log(`PROPERTIES WITHOUT TYPE: ${badTypes.length}`);

  process.exit(0);
}

checkRent();
