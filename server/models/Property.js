const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  location: {
    address: String,
    area: String,
    city: String,
    lat: Number,
    lng: Number
  },
  rent: { type: Number, required: true },
  deposit: { type: Number, required: true },
  bhkType: String,
  images: [{ type: String }],
  video: String,
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  matchScore: { type: Number, default: 0 },
  moveInReady: { type: Boolean, default: false },
  preferences: {
    bachelorAllowed: Boolean,
    maxOccupants: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
