const mongoose = require('mongoose');

const SearchConsoleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true,
    index: true
  },
  pagePath: {
    type: String,
    required: true,
    index: true
  },
  clicks: {
    type: Number,
    required: true,
    default: 0
  },
  impressions: {
    type: Number,
    required: true,
    default: 0
  },
  ctr: {
    type: Number,
    required: true,
    default: 0
  },
  position: {
    type: Number,
    required: true,
    default: 1.0
  },
  country: {
    type: String,
    required: true,
    default: 'India',
    index: true
  },
  device: {
    type: String,
    required: true,
    default: 'Mobile',
    index: true
  }
});

module.exports = mongoose.model('SearchConsole', SearchConsoleSchema);
