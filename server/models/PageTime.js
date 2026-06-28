const mongoose = require('mongoose');

const PageTimeSchema = new mongoose.Schema({
  pagePath: {
    type: String,
    required: true,
    index: true
  },
  timeSpent: {
    type: Number,
    required: true
  },
  visitorId: {
    type: String,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('PageTime', PageTimeSchema);
