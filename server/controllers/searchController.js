const Property = require("../models/Property");

exports.searchProperties = async (req, res) => {
  try {
    const { queryText = "" } = req.query;

    let query = { isActive: true };

    // LOGIC TEST LAYER: Log what backend receives
    console.log("== UNIQUE SEARCH MAPPED ==");
    console.log("queryText:", queryText);
    console.log("LOGIC LEVEL 1: Raw string received:", queryText);

    if (queryText) {
      query.$or = [
        { "location.area": new RegExp(queryText, "i") },
        { title: new RegExp(queryText, "i") }
      ];
    }

    const results = await Property.find(query).limit(20);
    console.log("RESULTS FOUND NATIVELY:", results.length);
    console.log("UI LOG: Displaying", results.length, "results for query:", queryText);

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
