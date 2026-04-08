require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    const props = await Property.find();
    let updated = 0;
    
    for (let p of props) {
        let lat = null;
        let lng = null;
        
        if (p.location && p.location.googleMapLink) {
             const match = p.location.googleMapLink.match(/q=([\d.-]+),([\d.-]+)/);
             if (match) {
                 lat = Number(match[1]);
                 lng = Number(match[2]);
             }
        }
        
        if (lat && lng) {
             p.location.coordinates = {
                 type: 'Point',
                 coordinates: [lng, lat]
             };
             await p.save();
             updated++;
        }
    }
    console.log("Fixed " + updated + " properties.");
    process.exit(0);
}
fix().catch(console.error);
