const Property = require("../models/Property");

exports.searchProperties = async (req, res) => {
  try {
    const { queryText = "" } = req.query;

    let query = { isActive: true };

    if (queryText) {
      query.$or = [
        { "location.area": new RegExp(queryText, "i") },
        { title: new RegExp(queryText, "i") }
      ];
    }

    const results = await Property.find(query).limit(20);

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
