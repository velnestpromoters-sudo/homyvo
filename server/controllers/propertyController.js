const Property = require('../models/Property');

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isActive: true }).select('title location.area rent images matchScore moveInReady isVerified');
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Role-based payload filtering
    const isTenant = req.user && req.user.role === 'tenant';
    
    if (isTenant) {
      // Full details (requires owner population or deeper fields)
      const fullProperty = await Property.findById(req.params.id).populate('ownerId', 'name mobile isVerified');
      return res.status(200).json({ success: true, data: fullProperty, access: 'full' });
    } else {
      // Limited details for guest
      const limitedProperty = {
        _id: property._id,
        title: property.title,
        location: { area: property.location.area, city: property.location.city },
        rent: property.rent,
        deposit: property.deposit,
        bhkType: property.bhkType,
        images: property.images.slice(0, 1), // Only 1 image
        isVerified: property.isVerified,
        matchScore: property.matchScore,
        moveInReady: property.moveInReady
      };
      return res.status(200).json({ success: true, data: limitedProperty, access: 'limited' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
