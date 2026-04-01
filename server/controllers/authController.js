const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpGenerator = require('otp-generator');
const { sendOTPEmail } = require('../services/emailService');
const { saveOTP, verifyOTP } = require('../utils/otpStore');

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true
    });

    await sendOTPEmail(email, otp);
    saveOTP(email, otp);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP Send Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyOTPAndLogin = async (req, res) => {
  try {
    const { email, otp, name, role } = req.body;

    const isValid = verifyOTP(email, otp);
    if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    let user = await User.findOne({ email });

    if (!user) {
      if (!name || !role) return res.status(400).json({ success: false, message: 'Name and role required for user creation' });
      user = await User.create({ email, name, role });
    } else {
      user.role = role || user.role;
      user.name = name || user.name;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '30d' }
    );

    res.json({ success: true, token, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
