const Property = require("../models/Property");

exports.searchProperties = async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius = 10, // Default 10km radius if not specified
      maxPrice,
      minPrice,
      propertyType,
      gender,
      sharing,
      bhkType,
      bachelorAllowed,
      sort
    } = req.query;

    let query = {
      isActive: true
    };

    // GEO SEARCH: The Root Fix overriding volatile String regexing
    if (lat && lng) {
      query["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)], // Order matters: Longitude, Latitude
          },
          $maxDistance: Number(radius) * 1000, // Converts Kilometers out to raw Meters
        },
      };
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (maxPrice || minPrice) {
      query.rent = {};
      if (maxPrice) query.rent.$lte = Number(maxPrice);
      if (minPrice) query.rent.$gte = Number(minPrice);
    }

    if (propertyType === "pg") {
      if (gender) query["pgDetails.gender"] = gender;

      if (sharing) {
        query["pgDetails.rooms"] = {
          $elemMatch: {
            sharing: Number(sharing),
            availableBeds: { $gt: 0 },
          },
        };
      }
    }

    if (propertyType === "apartment") {
      if (bhkType) query.bhkType = new RegExp(bhkType, "i");
      if (bachelorAllowed !== undefined && bachelorAllowed !== "false") {
         query["preferences.bachelorAllowed"] = true;
      }
    }

    let sortObj = {};
    if (sort === "price_low") sortObj.rent = 1;
    else if (sort === "price_high") sortObj.rent = -1;
    else if (sort === "latest") sortObj.createdAt = -1;
    
    // Note: If using $near, MongoDB inherently sorts by distance inherently!
    // Appending other sort keys can conflict with the $near natural sorting if not handled.
    if (!lat || !lng) {
       // Only apply match score if not doing a strict distance sort
       if (!Object.keys(sortObj).length) sortObj.matchScore = -1; 
    }

    const results = await Property.find(query).sort(sortObj).limit(30);

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error("Geo-Search API Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
