require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

async function test() {
   await mongoose.connect(process.env.MONGO_URI);
   const props = await Property.find({}, 'title location.address location.area location.city location.coordinates location.googleMapLink');
   
   console.log('Total Properties:', props.length);
   props.forEach((p, idx) => {
       console.log(`\n[${idx + 1}] Title: ${p.title}`);
       console.log(`Address: ${p.location?.address}`);
       console.log(`Area: ${p.location?.area}, City: ${p.location?.city}`);
       console.log(`Google Map Link: ${p.location?.googleMapLink}`);
       console.log(`Coordinates:`, p.location?.coordinates?.coordinates);
   });
   process.exit();
}
test();
