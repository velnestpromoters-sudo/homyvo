require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const props = await Property.find();
    let updated = 0;
    for (let p of props) {
       if (p.location && p.location.lat && p.location.lng && !p.location.coordinates) {
          p.location.coordinates = {
              type: 'Point',
              coordinates: [p.location.lng, p.location.lat]
          };
          await p.save();
          updated++;
       }
    }
    console.log(`Successfully migrated ${updated} missing legacy properties to 2D-Sphere Coordinates GeoJSON format.`);
    process.exit(0);
}
run().catch(console.error);
