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
  invoiceNumber: { type: String, default: '' },
  invoiceGeneratedAt: { type: Date, default: null },
}, { timestamps: true });

// Index for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
