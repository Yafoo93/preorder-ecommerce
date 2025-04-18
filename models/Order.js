const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  paymentProof: String,
  status: { type: String, enum: ['Pending Confirmation', 'Confirmed'], default: 'Pending Confirmation' },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
