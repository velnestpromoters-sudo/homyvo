const mongoose = require('mongoose');

const IndexingStatusSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  indexedCount: {
    type: Number,
    required: true,
    default: 0
  },
  notIndexedCount: {
    type: Number,
    required: true,
    default: 0
  },
  impressions: {
    type: Number,
    required: true,
    default: 0
  },
  reasons: [
    {
      reason: String,
      source: String,
      validation: String,
      pagesCount: Number,
      history: [Number] // daily counts for sparkline trend
    }
  ]
});

module.exports = mongoose.model('IndexingStatus', IndexingStatusSchema);
