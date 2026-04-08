require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

async function check() {
   await mongoose.connect(process.env.MONGO_URI);
   const props = await Property.find().select('location title');
   console.log(JSON.stringify(props, null, 2));
   process.exit(0);
}
check().catch(console.error);
