const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  location: {
    address: String,
    area: String,
    city: String,
    googleMapLink: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }
    }
  },
  rent: { type: Number, required: true },
  deposit: { type: Number, required: true },
  bhkType: String,
  images: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  availability: { type: String, enum: ['immediate', 'next_month', 'specific_date'], default: 'immediate' },
  availableFrom: { type: Date },
  listingPaymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  matchScore: { type: Number, default: 0 },
  moveInReady: { type: Boolean, default: false },
  tenantNotes: { type: String, default: '' },
  amenities: [{ type: String }],
  furnishing: { type: String, enum: ['full', 'semi', 'none'], default: 'none' },
  propertyType: { type: String, enum: ['apartment', 'pg'], default: 'apartment' },
  pgDetails: {
    gender: { type: String, enum: ['boys', 'girls', 'co-living'] },
    totalRooms: Number,
    sharingTypes: [Number],
    rooms: [{
        sharing: Number,
        totalBeds: Number,
        availableBeds: Number
    }]
  },
  preferences: {
    bachelorAllowed: Boolean,
    maxOccupants: Number
  }
}, { timestamps: true });

propertySchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model('Property', propertySchema);
