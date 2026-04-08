const Property = require('../models/Property');
const Access = require('../models/Access');

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isActive: true }).select('title location rent images matchScore moveInReady isVerified ownerId bhkType preferences propertyType pgDetails tenantNotes');
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('ownerId', 'name mobile isVerified');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const isAuthenticated = req.user != null;

    if (isAuthenticated) {
      const isOwner = property.ownerId._id.toString() === req.user._id.toString();
      
      let canView = isOwner;
      if (!isOwner) {
         const hasPaid = await Access.findOne({
            user: req.user._id,
            property: property._id,
            paymentStatus: "paid"
         });
         if (hasPaid) canView = true;
      }

      // Redact contact data if not paid and not owner
      const propertyData = property.toObject();
      if (!canView) {
         propertyData.ownerId = {
            name: "Verified Owner",
            mobile: "+91 xxxxx xxxxx",
            isVerified: propertyData.ownerId?.isVerified,
            _id: propertyData.ownerId?._id
         };
      }

      return res.status(200).json({ 
        success: true, 
        data: propertyData, 
        access: canView ? 'full' : 'limited' 
      });
    } else {
      // Limited details for guest
      const limitedProperty = {
        _id: property._id,
        title: property.title,
        location: { area: property.location.area, city: property.location.city },
        rent: property.rent,
        deposit: property.deposit,
        bhkType: property.bhkType,
        images: property.images.slice(0, 1),
        isVerified: property.isVerified,
        matchScore: property.matchScore,
        moveInReady: property.moveInReady,
        tenantNotes: property.tenantNotes
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
    let parsedPgDetails = undefined;
    try {
        if (req.body.location) {
            parsedLocation = JSON.parse(req.body.location);
            // Native Map to GeoJSON Schema
            if (parsedLocation.lat && parsedLocation.lng) {
                parsedLocation.coordinates = {
                   type: "Point",
                   coordinates: [Number(parsedLocation.lng), Number(parsedLocation.lat)]
                };
            }
        }
        if (req.body.preferences) parsedPreferences = JSON.parse(req.body.preferences);
        if (req.body.pgDetails) parsedPgDetails = JSON.parse(req.body.pgDetails);
    } catch(e) { console.error("Error parsing JSON body fields:", e); }

    const newProperty = await Property.create({
      title: req.body.title,
      rent: req.body.rent,
      deposit: req.body.deposit,
      bhkType: req.body.bhkType,
      moveInReady: req.body.moveInReady === 'true',
      propertyType: req.body.propertyType || 'apartment',
      location: parsedLocation,
      preferences: parsedPreferences,
      pgDetails: req.body.propertyType === 'pg' ? parsedPgDetails : undefined,
      tenantNotes: req.body.tenantNotes || '',
      images: imageUrls,
      ownerId: req.user._id,
    });

    res.status(201).json({ success: true, data: newProperty });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || err.toString() || "Unknown error", details: err });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
      const propertyId = req.params.id;
      const property = await Property.findById(propertyId);

      if (!property) {
          return res.status(404).json({ success: false, message: "Property not found" });
      }
      
      if (property.ownerId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: "Unauthorized to edit this property configuration." });
      }

      if (property.propertyType === 'pg') {
          if (!req.body.rooms || !Array.isArray(req.body.rooms)) {
             return res.status(400).json({ success: false, message: "Valid rooms array mapping required for PG updates." });
          }
          
          const updatedRooms = property.pgDetails.rooms.map(dbRoom => {
             const payloadRoom = req.body.rooms.find(r => r.sharing === dbRoom.sharing);
             if (payloadRoom) {
                 const newAvailable = Math.max(0, Math.min(dbRoom.totalBeds, Number(payloadRoom.availableBeds)));
                 return { ...dbRoom._doc, availableBeds: newAvailable };
             }
             return dbRoom;
          });
          
          property.pgDetails.rooms = updatedRooms;
      } else {
          if (req.body.moveInReady !== undefined) {
             property.moveInReady = req.body.moveInReady;
          }
          if (req.body.bachelorAllowed !== undefined) {
             if (!property.preferences) property.preferences = {};
             property.preferences.bachelorAllowed = req.body.bachelorAllowed;
             property.markModified('preferences');
          }
      }
      
      // Handle unconditional Notes Updates if provided
      if (req.body.tenantNotes !== undefined) {
         property.tenantNotes = req.body.tenantNotes;
      }

      await property.save();
      res.status(200).json({ success: true, data: property });
  } catch(error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
      const propertyId = req.params.id;
      const property = await Property.findById(propertyId);

      if (!property) {
          return res.status(404).json({ success: false, message: "Property not found" });
      }
      
      if (property.ownerId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: "Unauthorized to delete this property." });
      }

      await property.deleteOne();
      res.status(200).json({ success: true, message: "Property deleted successfully" });
  } catch(error) {
      console.error("Delete property error:", error);
      res.status(500).json({ success: false, message: error.message });
  }
};
