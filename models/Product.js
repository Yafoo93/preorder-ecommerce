const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  price: { type: Number, required: true },
  image: String,
  preorderDeadline: { type: Date, default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
