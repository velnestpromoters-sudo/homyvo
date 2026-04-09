const Property = require("../models/Property");

exports.searchProperties = async (req, res) => {
  try {
    const {
      queryText = "",
      lat,
      lng,
      radius = 5000,
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

    const pipeline = [];
    const searchStage = {
      $search: {
        index: "property_search",
        compound: {
          filter: [
             { equals: { path: "isActive", value: true } }
          ]
        }
      }
    };

    // FUZZY TEXT SEARCH (Only injected if queryText has actual text)
    if (queryText && queryText.trim().length > 0) {
      searchStage.$search.compound.must = [
        {
          text: {
            query: queryText.trim(),
            path: ["title", "description", "location.area", "location.address"],
            fuzzy: { maxEdits: 2 }
          }
        }
      ];
    }

    // GEO FILTER
    if (lat && lng) {
      searchStage.$search.compound.filter.push({
        geoWithin: {
          circle: {
            center: {
              type: "Point",
              coordinates: [Number(lng), Number(lat)]
            },
            radius: Number(radius) * (radius < 1000 ? 1000 : 1) // Ensure it's in meters natively!
          },
          path: "location.coordinates"
        }
      });
    }

    // PRICE (RENT) FILTER
    if (minPrice || maxPrice) {
      const rangeOp = { path: "rent" };
      if (minPrice) rangeOp.gte = Number(minPrice);
      if (maxPrice) rangeOp.lte = Number(maxPrice);
      searchStage.$search.compound.filter.push({ range: rangeOp });
    }

    // PROPERTY TYPE
    if (propertyType) {
      searchStage.$search.compound.filter.push({
        equals: {
          path: "propertyType",
          value: propertyType
        }
      });
    }

    // PG FILTERS
    if (propertyType === "pg") {
      if (gender) {
        searchStage.$search.compound.filter.push({
          equals: {
            path: "pgDetails.gender",
            value: gender
          }
        });
      }

      if (sharing) {
        searchStage.$search.compound.filter.push({
          equals: {
            path: "pgDetails.rooms.sharing",
            value: Number(sharing)
          }
        });
      }
    }

    // BHK
    if (bhkType) {
      // Provide regex-equivalent by ignoring exact case if fuzzy is handled or map correctly
      searchStage.$search.compound.filter.push({
        text: {
          query: bhkType,
          path: "bhkType"
        }
      });
    }

    // AMENITIES
    if (amenities) {
      const amensArray = amenities.split(",");
      searchStage.$search.compound.filter.push({
        text: {
          query: amensArray,
          path: "amenities"
        }
      });
    }

    // FURNISHING
    if (furnishing) {
      searchStage.$search.compound.filter.push({
        equals: {
          path: "furnishing",
          value: furnishing
        }
      });
    }

    // AVAILABILITY
    if (availability) {
      searchStage.$search.compound.filter.push({
        equals: {
          path: "availability",
          value: availability
        }
      });
    }

    pipeline.push(searchStage);

    // SORTING (If not relevance)
    if (sort === "price_low") {
       pipeline.push({ $sort: { rent: 1 } });
    } else if (sort === "price_high") {
       pipeline.push({ $sort: { rent: -1 } });
    } else if (sort === "latest") {
       pipeline.push({ $sort: { createdAt: -1 } });
    }

    // PAGINATION LIMIT
    pipeline.push({ $limit: 40 });

    // EXECUTE
    const results = await Property.aggregate(pipeline);

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error("Advanced Atlas Engine Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
