const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Property = require('../models/Property');
const Access = require('../models/Access');

// Hardcoded Admin Credentials
const ADMIN_EMAIL = 'velnestpromoters@gmail.com';
const ADMIN_PASS = 'admin#123';

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      // Issue special admin token bypassing DB structure
      const token = jwt.sign(
        { id: 'admin_superuser', role: 'admin' }, 
        process.env.JWT_SECRET || 'fallback_secret', 
        { expiresIn: '7d' }
      );
      
      return res.json({ 
        success: true, 
        token, 
        data: { name: 'Velnest Admin', role: 'admin', email: ADMIN_EMAIL } 
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ success: false, message: 'Server error during admin login' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Parallel execution for high-speed metrics aggregation
    const [
      owners,
      tenants,
      totalPropertiesCount,
      activePropertiesCount,
      unlocksCount
    ] = await Promise.all([
      User.find({ role: 'owner' }).select('name email mobile createdAt').sort({ createdAt: -1 }),
      User.find({ role: 'tenant' }).select('name email mobile createdAt').sort({ createdAt: -1 }),
      Property.countDocuments(),
      Property.countDocuments({ isActive: true }), // Only paid/active properties
      Access.countDocuments() // Unlocks = payment accesses granted
    ]);

    // 2. Compute App Usage Growth (Last 30 Days vs Previous 30 Days Users)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentUsersCount = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const previousUsersCount = await User.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    let growthPercentage = 0;
    if (previousUsersCount === 0) {
      growthPercentage = recentUsersCount > 0 ? 100 : 0;
    } else {
      growthPercentage = Math.round(((recentUsersCount - previousUsersCount) / previousUsersCount) * 100);
    }

    // 3. Fetch live Quotas
    const Quota = require('../models/Quota');
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toISOString().substring(0, 7);
    
    const [emailQuota, geminiQuota] = await Promise.all([
       Quota.findOne({ type: 'emailjs_monthly', period: month }),
       Quota.findOne({ type: 'gemini_daily', period: today })
    ]);

    res.json({
      success: true,
      data: {
        owners: owners, // Full array of owners
        tenants: tenants, // Full array of tenants
        properties: {
           total: totalPropertiesCount,
           active: activePropertiesCount
        },
        unlocks: unlocksCount,
        growth: {
          percentage: growthPercentage,
          trend: growthPercentage >= 0 ? 'up' : 'down',
          recentSignups: recentUsersCount
        },
        quotas: {
          emailjs: { used: emailQuota ? emailQuota.used : 0, limit: 200 },
          geminiRpd: { used: geminiQuota ? geminiQuota.used : 0, limit: 1500 }
        }
      }
    });

  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ success: false, message: 'Failed to aggregate admin metrics' });
  }
};

exports.getDatabaseStats = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    // Get database wide stats
    const dbStats = await db.stats();
    
    // Get list of collections
    const collections = await db.listCollections().toArray();
    
    // Get stats for each collection
    const collectionDetails = await Promise.all(collections.map(async (col) => {
      try {
        const stats = await db.command({ collStats: col.name });
        return {
          name: col.name,
          count: stats.count,
          size: stats.size, // bytes
          storageSize: stats.storageSize, // bytes
          nindexes: stats.nindexes,
          totalIndexSize: stats.totalIndexSize
        };
      } catch (e) {
        // Fallback for system collections if stats command fails
        return {
          name: col.name,
          count: 0,
          size: 0,
          storageSize: 0,
          nindexes: 0,
          totalIndexSize: 0
        };
      }
    }));

    res.json({
      success: true,
      data: {
        plan: 'Atlas Shared (M0 Free)',
        dbName: dbStats.db,
        collectionsCount: dbStats.collections,
        documentsCount: dbStats.objects,
        dataSize: dbStats.dataSize, // bytes
        storageSize: dbStats.storageSize, // bytes
        indexSize: dbStats.indexSize, // bytes
        collections: collectionDetails.sort((a, b) => b.size - a.size) // sort by size desc
      }
    });
  } catch (err) {
    console.error("Database Stats Error:", err);
    res.status(500).json({ success: false, message: 'Failed to retrieve database stats' });
  }
};

exports.getCollectionData = async (req, res) => {
  try {
    const { name } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    // Check if collection exists
    const collections = await db.listCollections({ name }).toArray();
    if (collections.length === 0) {
      return res.status(404).json({ success: false, message: `Collection '${name}' not found` });
    }

    // Get total count
    const totalDocs = await db.collection(name).countDocuments();

    // Fetch documents
    const documents = await db.collection(name)
      .find({})
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({
      success: true,
      data: {
        name,
        total: totalDocs,
        page,
        limit,
        totalPages: Math.ceil(totalDocs / limit),
        documents
      }
    });
  } catch (err) {
    console.error("Collection Data Error:", err);
    res.status(500).json({ success: false, message: 'Failed to retrieve collection data' });
  }
};

exports.getCloudinaryStats = async (req, res) => {
  try {
    const cloudinary = require('../config/cloudinary');
    const Property = require('../models/Property');
    
    // Fetch usage details from Cloudinary
    const usage = await cloudinary.api.usage();
    
    // Fetch latest 50 resources
    const resourcesResponse = await cloudinary.api.resources({
      max_results: 50,
      type: 'upload',
      resource_type: 'image'
    });

    // Build mapping of image URL to property owner
    const properties = await Property.find({}).populate('ownerId', 'name');
    const imageOwnerMap = {};
    properties.forEach(prop => {
      const ownerName = (prop.ownerId && prop.ownerId.name) || (prop.contactNumbers && prop.contactNumbers.name) || 'Unknown Owner';
      if (prop.images && Array.isArray(prop.images)) {
        prop.images.forEach(imgUrl => {
          if (imgUrl) {
            imageOwnerMap[imgUrl] = {
              ownerName,
              propertyTitle: prop.title
            };
          }
        });
      }
    });

    res.json({
      success: true,
      data: {
        plan: usage.plan || 'Free',
        storageUsed: usage.storage.usage, // bytes
        storageLimit: (usage.credits.limit || 25) * 1024 * 1024 * 1024, // bytes (max storage capacity)
        impressions: usage.impressions.usage,
        transformations: usage.transformations.usage,
        bandwidthUsed: usage.bandwidth.usage, // bytes
        creditsLimit: usage.credits.limit,
        creditsUsed: usage.credits.usage,
        creditsUsedPercent: usage.credits.used_percent,
        resources: resourcesResponse.resources.map(r => {
          const matchingUrlKey = Object.keys(imageOwnerMap).find(urlKey => 
            urlKey.includes(r.public_id) || r.secure_url.includes(urlKey)
          );
          const ownerInfo = matchingUrlKey ? imageOwnerMap[matchingUrlKey] : { ownerName: 'Unknown Owner', propertyTitle: 'Unlinked Asset' };
          
          return {
            public_id: r.public_id,
            format: r.format,
            version: r.version,
            resource_type: r.resource_type,
            created_at: r.created_at,
            bytes: r.bytes,
            width: r.width,
            height: r.height,
            url: r.url,
            secure_url: r.secure_url,
            ownerName: ownerInfo.ownerName,
            propertyTitle: ownerInfo.propertyTitle
          };
        })
      }
    });
  } catch (err) {
    console.error("Cloudinary Stats Error:", err);
    res.status(500).json({ success: false, message: 'Failed to retrieve Cloudinary stats' });
  }
};

exports.getCloudinaryResources = async (req, res) => {
  try {
    const cloudinary = require('../config/cloudinary');
    const Property = require('../models/Property');
    const { nextCursor } = req.query;

    const options = {
      max_results: 50,
      type: 'upload',
      resource_type: 'image'
    };

    if (nextCursor) {
      options.next_cursor = nextCursor;
    }

    const resourcesResponse = await cloudinary.api.resources(options);

    // Build mapping
    const properties = await Property.find({}).populate('ownerId', 'name');
    const imageOwnerMap = {};
    properties.forEach(prop => {
      const ownerName = (prop.ownerId && prop.ownerId.name) || (prop.contactNumbers && prop.contactNumbers.name) || 'Unknown Owner';
      if (prop.images && Array.isArray(prop.images)) {
        prop.images.forEach(imgUrl => {
          if (imgUrl) {
            imageOwnerMap[imgUrl] = {
              ownerName,
              propertyTitle: prop.title
            };
          }
        });
      }
    });

    res.json({
      success: true,
      data: {
        resources: resourcesResponse.resources.map(r => {
          const matchingUrlKey = Object.keys(imageOwnerMap).find(urlKey => 
            urlKey.includes(r.public_id) || r.secure_url.includes(urlKey)
          );
          const ownerInfo = matchingUrlKey ? imageOwnerMap[matchingUrlKey] : { ownerName: 'Unknown Owner', propertyTitle: 'Unlinked Asset' };

          return {
            public_id: r.public_id,
            format: r.format,
            version: r.version,
            resource_type: r.resource_type,
            created_at: r.created_at,
            bytes: r.bytes,
            width: r.width,
            height: r.height,
            url: r.url,
            secure_url: r.secure_url,
            ownerName: ownerInfo.ownerName,
            propertyTitle: ownerInfo.propertyTitle
          };
        }),
        nextCursor: resourcesResponse.next_cursor
      }
    });
  } catch (err) {
    console.error("Cloudinary Resources Error:", err);
    res.status(500).json({ success: false, message: 'Failed to retrieve Cloudinary resources' });
  }
};

exports.deleteCloudinaryResource = async (req, res) => {
  try {
    const cloudinary = require('../config/cloudinary');
    const Property = require('../models/Property');
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ success: false, message: 'public_id is required' });
    }

    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === 'ok') {
      // Remove this image reference from any Property document in MongoDB
      const properties = await Property.find({ images: { $regex: public_id } });
      for (const prop of properties) {
        prop.images = prop.images.filter(img => !img.includes(public_id));
        await prop.save();
      }

      res.json({ success: true, message: 'Asset deleted successfully from Cloudinary & Property database.' });
    } else {
      res.status(400).json({ success: false, message: `Failed to delete from Cloudinary: ${result.result}` });
    }
  } catch (err) {
    console.error("Cloudinary Delete Error:", err);
    res.status(500).json({ success: false, message: 'Failed to delete asset from Cloudinary' });
  }
};
