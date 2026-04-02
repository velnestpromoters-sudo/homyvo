const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  mobile: { type: String, sparse: true },
  gender: { type: String, enum: ['male', 'female', 'other'], sparse: true },
  password: { type: String }, // Hashed password for permanent logins
  role: { type: String, enum: ['tenant', 'owner'] },
  isVerified: { type: Boolean, default: false },
  tenantProfile: {
    budget: Number,
    preferredZones: [String],
    occupants: Number,
    workType: String
  },
  ownerProfile: {
    trustScore: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
