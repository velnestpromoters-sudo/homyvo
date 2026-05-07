const Property = require('../models/Property');
const Access = require('../models/Access');

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isActive: true }).select('title location rent images matchScore moveInReady isVerified ownerId bhkType preferences propertyType pgDetails tenantNotes boostExpiresAt');
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
        images: property.images,
        isVerified: property.isVerified,
        matchScore: property.matchScore,
        moveInReady: property.moveInReady,
        tenantNotes: property.tenantNotes,
        floor: property.floor,
        totalFloors: property.totalFloors,
        areaSqft: property.areaSqft,
        propertyAge: property.propertyAge,
        highlights: property.highlights,
        amenities: property.amenities,
        furnishing: property.furnishing,
        availability: property.availability,
        preferences: property.preferences,
        propertyType: property.propertyType,
        pgDetails: property.pgDetails
      };
      return res.status(200).json({ success: true, data: limitedProperty, access: 'limited' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.registerView = async (req, res) => {
  try {
    const propertyId = req.params.id;
    // Extract registered account or fallback cleanly capturing organic traffic metrics securely via headers natively
    const viewerHash = req.user ? req.user._id.toString() : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || "anonymous_ip");

    await Property.findByIdAndUpdate(propertyId, {
        $addToSet: { uniqueViewers: viewerHash }
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOwnerAnalytics = async (req, res) => {
  try {
     const ownerProps = await Property.find({ ownerId: req.user._id, isActive: true }).select('title uniqueViewers images');
     
     // Parallel aggregate execution efficiently matching transaction maps completely natively 
     let compiledData = [];
     for (const prop of ownerProps) {
         const unlockCount = await Access.countDocuments({ property: prop._id, paymentStatus: 'paid' });
         compiledData.push({
             _id: prop._id,
             title: prop.title,
             views: prop.uniqueViewers ? prop.uniqueViewers.length : 0,
             unlocks: unlockCount,
             images: prop.images
         });
     }
     
     res.status(200).json({ success: true, data: compiledData });
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
};

const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

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
            
            // Failsafe: If no frontend latitude, extract securely from Map link natively
            if ((!parsedLocation.lat || !parsedLocation.lng) && parsedLocation.googleMapLink) {
                 let finalUrl = parsedLocation.googleMapLink;
                 
                 // Intercept short links natively bypassing structural failures
                 if (finalUrl.includes('goo.gl')) {
                     try {
                        const resp = await fetch(finalUrl, { 
                           method: 'GET', 
                           redirect: 'follow',
                           headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                        });
                        
                        if (resp.url) finalUrl = resp.url;
                        
                        // Deep decryption: Scrape the raw HTML for hidden explicit tracking maps
                        const htmlText = await resp.text();
                        const regMeta = htmlText.match(/center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/);
                        
                        // If coordinates exist natively encrypted in the DOM tree, pull them instantly
                        if (regMeta) {
                           parsedLocation.lat = Number(regMeta[1]);
                           parsedLocation.lng = Number(regMeta[2]);
                        }
                     } catch(e) { console.error("Deep URL redirect extraction failed:", e); }
                 }

                 // Only run secondary string evaluations if deep HTML decryption failed
                 if (!parsedLocation.lat || !parsedLocation.lng) {
                     const regStandard = finalUrl.match(/q=([\d.-]+),([\d.-]+)/);
                     const searchMatch = finalUrl.match(/search\/(-?\d+\.\d+)(?:,|%2C)[+ ]*(-?\d+\.\d+)/);
                     const atMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                     const placeMatch = finalUrl.match(/place\/.*?\/@(-?\d+\.\d+),(-?\d+\.\d+)/);

                 if (regStandard) {
                     parsedLocation.lat = Number(regStandard[1]);
                     parsedLocation.lng = Number(regStandard[2]);
                 } else if (searchMatch) {
                     parsedLocation.lat = Number(searchMatch[1]);
                     parsedLocation.lng = Number(searchMatch[2]);
                 } else if (placeMatch) {
                     parsedLocation.lat = Number(placeMatch[1]);
                     parsedLocation.lng = Number(placeMatch[2]);
                 } else if (atMatch) {
                     parsedLocation.lat = Number(atMatch[1]);
                     parsedLocation.lng = Number(atMatch[2]);
                 }
                 
                 // Standardize the link format to the exact explicit coordinate tracking mapping
                 if (parsedLocation.lat && parsedLocation.lng) {
                     parsedLocation.googleMapLink = `https://maps.google.com/?q=${parsedLocation.lat},${parsedLocation.lng}`;
                 }
             } // closes secondary evaluation
         } // closes main map link extraction block

        // Native Map to GeoJSON Schema
            if (parsedLocation.lat && parsedLocation.lng) {
                parsedLocation.coordinates = {
                   type: "Point",
                   coordinates: [Number(parsedLocation.lng), Number(parsedLocation.lat)]
                };
            } else {
                // If coordinate mapping entirely fails, sanitize object to prevent structural 2dsphere DB crash
                delete parsedLocation.coordinates;
            }
        }
        if (req.body.preferences) parsedPreferences = JSON.parse(req.body.preferences);
        if (req.body.pgDetails) parsedPgDetails = JSON.parse(req.body.pgDetails);
        let parsedContactNumbers = undefined;
        if (req.body.contactNumbers) parsedContactNumbers = JSON.parse(req.body.contactNumbers);
    } catch(e) { console.error("Error parsing JSON body fields:", e); }

    const newProperty = await Property.create({
      title: req.body.title,
      rent: req.body.rent,
      deposit: req.body.deposit,
      bhkType: req.body.bhkType,
      moveInReady: req.body.moveInReady === 'true',
      propertyType: req.body.propertyType || 'apartment',
      amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
      furnishing: req.body.furnishing || 'none',
      availability: req.body.availability || 'immediate',
      availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : undefined,
      location: parsedLocation,
      preferences: parsedPreferences,
      pgDetails: req.body.propertyType === 'pg' ? parsedPgDetails : undefined,
      tenantNotes: req.body.tenantNotes || '',
      images: imageUrls,
      ownerId: req.user._id,
      contactNumbers: parsedContactNumbers,
      isActive: true, // TEMPORARY: Free listing offer
      listingPaymentStatus: "paid", // TEMPORARY: Free listing offer
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

      // Unconditionally update contact slots limiter via Quick Actions
      if (req.body.availableContactSlots !== undefined) {
         property.availableContactSlots = Math.max(0, Number(req.body.availableContactSlots));
      }
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

      // Pre-deletion hook: Scrub physical Cloudinary artifacts using extracted public_id slices natively
      if (property.images && property.images.length > 0) {
          for (let imgUrl of property.images) {
              try {
                  const parts = imgUrl.split('/upload/');
                  if (parts.length === 2) {
                      let path = parts[1].split('/').slice(1).join('/'); 
                      let publicId = path.split('.')[0]; 
                      if (publicId) await deleteFromCloudinary(publicId);
                  }
              } catch (e) {
                  console.warn("Failed to extract Cloudinary slice for cleanup:", imgUrl);
              }
          }
      }

      await property.deleteOne();
      res.status(200).json({ success: true, message: "Property and Cloudinary assets deleted successfully" });
  } catch(error) {
      console.error("Delete property error:", error);
      res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
      const propertyId = req.params.id;
      const property = await Property.findById(propertyId);

      if (!property) {
          return res.status(404).json({ success: false, message: "Property not found" });
      }
      
      if (property.ownerId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: "Unauthorized to update this property." });
      }

      // Merge native updates securely avoiding ownerId or coordinate overwrites directly unless isolated
      const allowedUpdates = ['title', 'rent', 'deposit', 'bhkType', 'tenantNotes', 'amenities', 'furnishing', 'availability', 'availableFrom', 'availableContactSlots', 'floor', 'totalFloors', 'areaSqft', 'propertyAge', 'highlights'];
      
      allowedUpdates.forEach(field => {
         if (req.body[field] !== undefined) {
             property[field] = req.body[field];
         }
      });
      
      // Handle nested structures softly
      if (req.body.preferences) {
          property.preferences = { ...property.preferences, ...req.body.preferences };
          property.markModified('preferences');
      }
      if (req.body.contactNumbers) {
          property.contactNumbers = { ...property.contactNumbers, ...req.body.contactNumbers };
          property.markModified('contactNumbers');
      }

      await property.save();
      res.status(200).json({ success: true, data: property });
  } catch(error) {
      console.error("Update property error:", error);
      res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle Property Active Status
exports.togglePropertyStatus = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!property) return res.status(404).json({ success: false, message: "Property not found or unauthorized." });
    
    property.isActive = !property.isActive;
    await property.save();
    
    res.json({ success: true, isActive: property.isActive });
  } catch (error) {
    console.error("Toggle Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle status." });
  }
};

// Validate Wishlist Array against active DB
exports.validateWishlist = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
       return res.status(400).json({ success: false, message: "Invalid IDs array format" });
    }
    
    // Aggregate strictly the active IDs natively mapped against the user's local array
    const activeProperties = await Property.find({ _id: { $in: ids }, isActive: true }).lean();
    const activeIds = activeProperties.map(p => p._id.toString());
    
    res.json({ success: true, activeIds, populatedProperties: activeProperties });
  } catch (error) {
    console.error("Wishlist Validation Error:", error);
    res.status(500).json({ success: false, message: "Failed to validate wishlist." });
  }
};

// Get All Owner Listings (Active & Inactive)
exports.getMyListings = async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user._id });
    res.json({ success: true, data: properties });
  } catch (error) {
    console.error("Get My Listings Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch listings." });
  }
};

// AI Recommendation Engine
exports.getRecommendations = async (req, res) => {
  try {
     const { wishlistIds = [], filter = 'best_match', lat, lng } = req.body;
     
     // Note: isVerified was temporarily lifted to allow test environments to supply unverified listings into heuristics natively.
     let query = { isActive: true, _id: { $nin: wishlistIds } };
     
     // Spatial overrides
     if (filter === 'nearest' && lat && lng) {
        query["location.coordinates"] = {
           $near: {
              $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
              $maxDistance: 15000 // 15km cutoff
           }
        };
     }
     if (filter === 'furnished') query.furnishing = 'full';
     if (filter === 'checkin') query.availability = 'immediate';
     
     let dbQuery = Property.find(query).limit(10);
     if (filter === 'price_low') dbQuery = dbQuery.sort({ rent: 1 });
     else if (filter === 'price_high') dbQuery = dbQuery.sort({ rent: -1 });
     else if (filter === 'best_match' || filter === 'amenities') {
        dbQuery = Property.find(query).limit(50); // Broad context for heuristic mapping
     }

     let rawProperties = await dbQuery.lean();
     
     // Intelligence AI Heuristic Sequence
     if (filter === 'best_match' && wishlistIds.length > 0) {
        const savedNodes = await Property.find({ _id: { $in: wishlistIds } }).lean();
        if (savedNodes.length > 0) {
           const avgRent = savedNodes.reduce((acc, curr) => acc + curr.rent, 0) / savedNodes.length;
           
           const bhkFreq = {};
           savedNodes.forEach(p => { if (p.bhkType) bhkFreq[p.bhkType] = (bhkFreq[p.bhkType] || 0) + 1; });
           const dominantBhk = Object.keys(bhkFreq).reduce((a, b) => bhkFreq[a] > bhkFreq[b] ? a : b, null);
           
           const dTypes = {};
           savedNodes.forEach(p => { if (p.propertyType) dTypes[p.propertyType] = (dTypes[p.propertyType] || 0) + 1; });
           const dominantType = Object.keys(dTypes).reduce((a, b) => dTypes[a] > dTypes[b] ? a : b, null);

           const popularAmenities = [...new Set(savedNodes.flatMap(p => p.amenities || []))];
           
           rawProperties.forEach(prop => {
              prop.score = 0;
              prop.scoreBreakdown = { budget: 0, layout: 0, architecture: 0, amenities: 0, maxLayout: 20, maxBudget: 15, maxArch: 10 };
              
              if (prop.rent >= avgRent * 0.8 && prop.rent <= avgRent * 1.2) {
                  prop.score += 15;
                  prop.scoreBreakdown.budget = 15;
              }
              if (dominantBhk && prop.bhkType === dominantBhk) {
                  prop.score += 20;
                  prop.scoreBreakdown.layout = 20;
              }
              if (dominantType && prop.propertyType === dominantType) {
                  prop.score += 10;
                  prop.scoreBreakdown.architecture = 10;
              }
              
              const crossMap = (prop.amenities || []).filter(a => popularAmenities.includes(a));
              const amenityScore = crossMap.length * 3;
              prop.score += amenityScore;
              prop.scoreBreakdown.amenities = amenityScore;
           });
           
           rawProperties = rawProperties.sort((a,b) => b.score - a.score).slice(0, 10);
        }
     } else if (filter === 'amenities') {
        rawProperties = rawProperties.sort((a, b) => (b.amenities?.length || 0) - (a.amenities?.length || 0)).slice(0, 10);
     }

     res.status(200).json({ success: true, count: rawProperties.length, data: rawProperties });
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
};
