const Property = require("../models/Property");

exports.searchProperties = async (req, res) => {
  try {
    const { queryText = "", lat, lng } = req.query;

    let query = { isActive: true };
    const qStr = queryText.toLowerCase();

    // 1. Intelligent Schema Matching for Bachelors/Families crossing PG and Apartment boundary states
    let customFilters = [];
    
    if (qStr.match(/\bboys\b/)) {
        customFilters.push({ 
           $or: [ 
             { "preferences.bachelorAllowed": true }, 
             { propertyType: 'pg', "pgDetails.gender": { $in: ['boys', 'co-living'] } } 
           ] 
        });
    } else if (qStr.match(/\bgirls\b/)) {
        customFilters.push({ 
           $or: [ 
             { "preferences.bachelorAllowed": true }, 
             { propertyType: 'pg', "pgDetails.gender": { $in: ['girls', 'co-living'] } } 
           ] 
        });
    } else if (qStr.match(/\bbachelor\b|\bpg\b/)) {
        customFilters.push({ 
           $or: [ 
             { "preferences.bachelorAllowed": true }, 
             { propertyType: 'pg' } 
           ] 
        });
    }

    if (qStr.match(/\bfamily\b/)) {
        query.propertyType = 'apartment'; // Families require standard apartments, bachelorAllowed flag is intentionally bypassed allowing both states natively
    }

    if (customFilters.length > 0) {
        query.$and = customFilters;
    }

    let results = [];

    // 2. Fundamental Spatial Search (Overrides entire text reliance)
    if (lat && lng && lat !== 'null' && lng !== 'null') {
      const numericLat = Number(lat);
      const numericLng = Number(lng);

      // NLP Dynamic Radius Extractor
      let maxDist = 3000; // Default 3KM
      const distanceMatch = qStr.match(/(?:within|in|under)\s+(\d+)\s*(km|m|kilometers|meters)\b/i) || qStr.match(/\b(\d+)\s*(km|k|m|meters)\b/i);
      
      if (distanceMatch) {
         const val = parseInt(distanceMatch[1], 10);
         const unit = distanceMatch[2].toLowerCase();
         if (unit === 'km' || unit === 'kilometers' || unit === 'k') {
            maxDist = val * 1000;
         } else if (unit === 'm' || unit === 'meters') {
            maxDist = val;
         }
         // Secure max boundary natively preserving stability (max 50km)
         if (maxDist > 50000) maxDist = 50000; 
      }

      // Attempt cutoff per spatial architecture context
      query["location.coordinates"] = {
        $near: {
          $geometry: { type: "Point", coordinates: [numericLng, numericLat] },
          $maxDistance: maxDist
        }
      };

      results = await Property.find(query).limit(20);

      // 3. Fallback: Check 5KM if yielding 0 outcomes naturally (only bypass if no stringent custom limits were enforced)
      if (results.length === 0 && !distanceMatch) {
        query["location.coordinates"].$near.$maxDistance = 5000; // 5KM
        results = await Property.find(query).limit(20);
      }
    } 
    // 4. Ultimate String Fallback (if user typed nonsense and OSM broke entirely)
    else {
      if (queryText) {
        query.$or = [
          { "location.area": new RegExp(queryText, "i") },
          { title: new RegExp(queryText, "i") }
        ];
        results = await Property.find(query).limit(20);
      } else {
        results = await Property.find(query).limit(20);
      }
    }

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
