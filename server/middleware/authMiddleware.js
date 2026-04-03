const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User mapping lost from DB (ghost token).' });
    }
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

exports.checkTenantAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = await User.findById(decoded.id);
      } catch (e) {
        req.user = null;
      }
    } else {
      req.user = null;
    }
    
    // Attach auth status but do not strictly block unless handled in controller
    next();
  } catch (error) {
    next();
  }
};
