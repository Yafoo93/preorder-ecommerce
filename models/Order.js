const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  paymentProof: String,
  status: { type: String, default: 'Awaiting Confirmation' },
  estimatedDeliveryDate: Date,
}, { timestamps: true });


module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
