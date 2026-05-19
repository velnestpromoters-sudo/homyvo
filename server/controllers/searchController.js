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
    }
    if (qStr.match(/\bgirls\b/)) {
        customFilters.push({ 
           $or: [ 
             { "preferences.bachelorAllowed": true }, 
             { propertyType: 'pg', "pgDetails.gender": { $in: ['girls', 'co-living'] } } 
           ] 
        });
    }
    if (qStr.match(/\bbachelor\b|\bpg\b/) && !qStr.match(/\bboys\b/) && !qStr.match(/\bgirls\b/)) {
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

    // Natural Language Price Matching: "under 5000", "below 10000", "max 8000"
    const priceMatch = qStr.match(/(?:under|below|max|<)\s*(\d+)/i);
    if (priceMatch && priceMatch[1]) {
        query.rent = { $lte: parseInt(priceMatch[1], 10) };
    }

    let results = [];

    // Extract search string logic so it's universally available for Hybrid Safety Net
    const cleanLocationStr = qStr.replace(/\b(pg|boys|girls|rent|house|apartment|bhk|room|flat|villa|mens|womens|in|near|around|for|under|below|max|<|\d+)\b/gi, '').trim();
    const searchStr = cleanLocationStr || qStr;

    // 2. Hybrid Search Logic (Spatial + Text Safety Net)
    if (lat && lng && lat !== 'null' && lng !== 'null') {
      const numericLat = Number(lat);
      const numericLng = Number(lng);

      // A: Spatial Query (Primary)
      let spatialResults = [];
      try {
        const spatialQuery = { ...query };
        spatialQuery["location.coordinates"] = {
          $near: {
            $geometry: { type: "Point", coordinates: [numericLng, numericLat] },
            $maxDistance: 5000 // Fixed 5KM range for hybrid merge
          }
        };
        spatialResults = await Property.find(spatialQuery).limit(20);
      } catch(e) { console.warn("Spatial search failed", e); }

      // B: Text Match Query (Safety Net for missing/bad coordinates)
      let textResults = [];
      try {
        if (searchStr && searchStr.length > 2) {
          const textQuery = { ...query };
          textQuery.$or = [
            { "location.area": new RegExp(searchStr, "i") },
            { title: new RegExp(searchStr, "i") },
            { "location.city": new RegExp(searchStr, "i") }
          ];
          textResults = await Property.find(textQuery).limit(20);
        }
      } catch(e) { console.warn("Text search failed", e); }

      // C: Smart Merge and Deduplication
      const mergedMap = new Map();
      spatialResults.forEach(p => mergedMap.set(p._id.toString(), p));
      textResults.forEach(p => {
        if (!mergedMap.has(p._id.toString())) {
          mergedMap.set(p._id.toString(), p);
        }
      });
      
      results = Array.from(mergedMap.values());
    } 
    // 3. Ultimate String Fallback (if OSM broke entirely)
    else {
      if (queryText && searchStr.length > 0) {
        query.$or = [
          { "location.area": new RegExp(searchStr, "i") },
          { title: new RegExp(searchStr, "i") },
          { "location.city": new RegExp(searchStr, "i") }
        ];
        results = await Property.find(query).limit(20);
      } else {
        results = await Property.find(query).limit(20);
      }
    }

const distance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

    // Calculate exact distances natively for all matching properties
    if (lat && lng && lat !== 'null' && lng !== 'null') {
      const numericLat = Number(lat);
      const numericLng = Number(lng);
      
      const enrichedResults = results.map(prop => {
         const pData = prop.toObject ? prop.toObject() : prop;
         if (pData.location && pData.location.coordinates && pData.location.coordinates.length === 2) {
             const [pLng, pLat] = pData.location.coordinates;
             pData.calculatedDistanceKm = parseFloat(distance(numericLat, numericLng, pLat, pLng).toFixed(2));
         } else {
             pData.calculatedDistanceKm = 999; // Text matched properties without valid coords get lowest priority
         }
         return pData;
      });
      // Sort by distance locally to guarantee closest-first UX
      enrichedResults.sort((a, b) => (a.calculatedDistanceKm || 999) - (b.calculatedDistanceKm || 999));
      
      return res.status(200).json({ success: true, count: enrichedResults.length, data: enrichedResults });
    }

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
