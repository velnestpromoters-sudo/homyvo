const Property = require("../models/Property");

exports.searchProperties = async (req, res) => {
  try {
    const {
      queryText = "",
      lat,
      lng,
      radius = 5,
      minPrice,
      maxPrice,
      propertyType,
      gender,
      sharing,
      bhkType,
      amenities,
      furnishing,
      availability,
      bachelorAllowed,
      sort
    } = req.query;

    let query = {
      isActive: true
    };

    // LOCATION TEXT SEARCH (ALWAYS WORKS)
    if (queryText && queryText.trim().length > 0) {
      const q = queryText.trim();
      query.$or = [
        { "location.area": new RegExp(q, "i") },
        { "location.city": new RegExp(q, "i") },
        { "location.address": new RegExp(q, "i") },
        { title: new RegExp(q, "i") }
      ];
    }

    // GEO SEARCH (ONLY IF LAT LNG EXISTS)
    if (lat && lng) {
      query["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: Number(radius) * 1000
        }
      };
    }

    // PRICE (RENT) FILTER
    if (minPrice || maxPrice) {
      query.rent = {};
      if (minPrice) query.rent.$gte = Number(minPrice);
      if (maxPrice) query.rent.$lte = Number(maxPrice);
    }

    // PROPERTY TYPE
    if (propertyType) query.propertyType = propertyType;

    // PG FILTER
    if (propertyType === "pg") {
      if (gender) query["pgDetails.gender"] = gender;

      if (sharing) {
        query["pgDetails.rooms"] = {
          $elemMatch: {
            sharing: Number(sharing),
            availableBeds: { $gt: 0 }
          }
        };
      }
    }

    // BHK
    if (bhkType) query.bhkType = new RegExp(bhkType, "i");

    // PHASE 4 ADVANCED ATTRIBUTES (Kept as strict equals for reliability)
    if (furnishing) query.furnishing = furnishing;
    if (availability) query.availability = availability;
    
    if (bachelorAllowed !== undefined && bachelorAllowed !== "false") {
       query["preferences.bachelorAllowed"] = true;
    }
    
    if (amenities) {
       const amensArray = amenities.split(",");
       query.amenities = { $all: amensArray };
    }

    // SORTING EXPLICIT
    let sortObj = {};
    if (sort === "price_low") sortObj.rent = 1;
    else if (sort === "price_high") sortObj.rent = -1;
    else if (sort === "latest") sortObj.createdAt = -1;

    const results = await Property.find(query).sort(sortObj).limit(50);

    // EXACT FRONTEND EXPECTED RETURN SCHEMA
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error("Mongoose Fallback Engine Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
