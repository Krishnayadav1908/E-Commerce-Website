const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: { type: Array, required: true },
  totalPrice: { type: Number, required: true },
  totalProducts: { type: Number, required: true },
  date: { type: String, required: true },
  status: { type: String, default: 'pending' },
  paymentMethod: { type: String, default: 'upi' },
  paymentStatus: { type: String, default: 'pending' },
  paymentRef: { type: String, default: '' },
  paymentNotes: { type: String, default: '' },
  paymentVerifiedAt: { type: Date, default: null },
  address: {
    type: Object,
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
