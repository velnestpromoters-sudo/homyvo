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
