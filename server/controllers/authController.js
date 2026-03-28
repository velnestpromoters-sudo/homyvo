const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { mobile, role } = req.body;

    if (!mobile || !role) {
      return res.status(400).json({ success: false, message: 'Mobile and role are required' });
    }

    if (!['tenant', 'owner'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    let user = await User.findOne({ mobile });

    if (user) {
      // If user exists, optionally update role if it's currently unset or just use existing logic
      user.role = role;
      await user.save();
    } else {
      // Create new user with selected role
      user = await User.create({ mobile, role });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      token,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
