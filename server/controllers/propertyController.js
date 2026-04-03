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

const { uploadToCloudinary } = require('../services/cloudinaryService');

exports.createProperty = async (req, res) => {
  try {
    const files = req.files;
    const imageUrls = [];

    if (files && files.length > 0) {
      for (let file of files) {
        // Enforce basic validation type constraints
        if (!file.mimetype.startsWith('image/')) continue;
        const url = await uploadToCloudinary(file.path);
        imageUrls.push(url);
      }
    }

    let parsedLocation = {};
    let parsedPreferences = {};
    try {
        if (req.body.location) parsedLocation = JSON.parse(req.body.location);
        if (req.body.preferences) parsedPreferences = JSON.parse(req.body.preferences);
    } catch(e) { console.error("Error parsing JSON body fields:", e); }

    const newProperty = await Property.create({
      title: req.body.title,
      rent: req.body.rent,
      deposit: req.body.deposit,
      bhkType: req.body.bhkType,
      moveInReady: req.body.moveInReady === 'true',
      location: parsedLocation,
      preferences: parsedPreferences,
      images: imageUrls,
      ownerId: req.user._id,
    });

    res.status(201).json({ success: true, data: newProperty });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || err.toString() || "Unknown error", details: err });
  }
};
