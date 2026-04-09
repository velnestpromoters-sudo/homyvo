const mongoose = require('mongoose');
const Property = require('./server/models/Property');
require('dotenv').config({ path: './server/.env' });

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
    console.log("Connected to MongoDB.");

    // 1. Check total DB contents
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ isActive: true });
    
    console.log(`TOTAL DB RECORDS: ${totalProperties}`);
    console.log(`ACTIVE PROPERTIES: ${activeProperties}`);

    // Check specific area
    const peelaProperties = await Property.countDocuments({ "location.area": /Peelamedu/i });
    console.log(`PROPERTIES IN PEELAMEDU: ${peelaProperties}`);

    const kalapattiProperties = await Property.countDocuments({ "location.area": /Kalapatti/i });
    console.log(`PROPERTIES IN KALAPATTI: ${kalapattiProperties}`);

    // If Peelamedu has 0, insert the test doc!
    if (peelaProperties === 0) {
      console.log("Inserting Test Property in Peelamedu...");
      await Property.create({
        title: "Test PG Peelamedu",
        rent: 5000,
        propertyType: "pg",
        isActive: true,
        location: {
          area: "Peelamedu",
          city: "Coimbatore",
          address: "Peelamedu, Coimbatore",
          coordinates: {
            type: "Point",
            coordinates: [76.9558, 11.0168]
          }
        }
      });
      console.log("Insert complete.");
    }

    // Now test the actual query logic that searchController uses
    console.log("\n--- RUNNING SEARCH CONTROLLER MOCK TEST ---");
    const testQuery = "Peelamedu";
    let query = { isActive: true };
    query.$or = [
      { "location.area": new RegExp(testQuery, "i") },
      { title: new RegExp(testQuery, "i") }
    ];

    const results = await Property.find(query).limit(20);
    console.log(`Search for "${testQuery}" returned ${results.length} results.`);
    if (results.length > 0) {
      console.log(`First Result Title: ${results[0].title}`);
      console.log(`First Result Area: ${results[0].location.area}`);
    }

    await mongoose.disconnect();
    console.log("Disconnected properly.");
  } catch(e) {
    console.error("Test blocked by Error:", e);
    process.exit(1);
  }
}

runTest();
