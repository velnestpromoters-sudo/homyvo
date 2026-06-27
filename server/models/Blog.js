const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  readTime: { type: String, required: true },
  author: { type: String, required: true },
  imageColor: { type: String, default: 'from-[#801786] to-[#ec38b7]' }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
