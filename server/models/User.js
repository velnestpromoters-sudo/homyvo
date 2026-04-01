const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  mobile: { type: String, sparse: true },
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
