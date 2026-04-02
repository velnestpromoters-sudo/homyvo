const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const otpGenerator = require('otp-generator');
const { sendOTPEmail } = require('../services/emailService');
const { saveOTP, verifyOTP } = require('../utils/otpStore');

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const existingUser = await User.findOne({ email });
    const isExistingUser = !!existingUser;
    const hasPassword = isExistingUser && !!existingUser.password;

    // Fast-path bypass: if user has a password, do NOT burn an EmailJS request or generate OTP.
    if (hasPassword) {
      return res.json({ success: true, message: "Use permanent password", isExistingUser, hasPassword });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true
    });

    await sendOTPEmail(email, otp);
    saveOTP(email, otp);

    res.json({ success: true, message: "OTP sent successfully", isExistingUser, hasPassword });
  } catch (err) {
    console.error("OTP Send Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyOTPAndLogin = async (req, res) => {
  try {
    const { email, otp, name, role, mobile, gender, password } = req.body;

    const isValid = verifyOTP(email, otp);
    if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    let user = await User.findOne({ email });

    let hashedPassword = null;
    if (password) {
       hashedPassword = await bcrypt.hash(password, 10);
    }

    if (!user) {
      if (!name || !role) return res.status(400).json({ success: false, message: 'Name and role required for user creation' });
      user = await User.create({ email, name, role, mobile, gender, password: hashedPassword });
    } else {
      user.role = role || user.role;
      user.name = name || user.name;
      user.mobile = mobile || user.mobile;
      user.gender = gender || user.gender;
      if (hashedPassword) user.password = hashedPassword;
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

exports.loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.password) return res.status(400).json({ success: false, message: 'No password set. Please log in with OTP.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid identity credentials' });

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
