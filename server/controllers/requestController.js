const Request = require('../models/Request');
const Property = require('../models/Property');

exports.applyForProperty = async (req, res) => {
  try {
    const { propertyId, tenantId } = req.body;

    // Must be logged-in tenant (enforced by protect + manual check)
    if (req.user.role !== 'tenant' || req.user._id.toString() !== tenantId) {
      return res.status(403).json({ success: false, message: 'Only authorized tenants can apply' });
    }

    const property = await Property.findById(propertyId);
    if (!property || !property.isActive) {
      return res.status(400).json({ success: false, message: 'Property is not active or available' });
    }

    const newRequest = await Request.create({
      propertyId,
      tenantId,
      status: 'PENDING'
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
