const mongoose = require('mongoose');

const quotaSchema = new mongoose.Schema({
    type: { type: String, enum: ['emailjs_monthly', 'gemini_daily'], required: true },
    period: { type: String, required: true }, // "YYYY-MM" for emailjs, "YYYY-MM-DD" for gemini
    used: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Quota', quotaSchema);
