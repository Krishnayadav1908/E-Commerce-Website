const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: { type: Array, required: true },
  totalPrice: { type: Number, required: true },
  totalProducts: { type: Number, required: true },
  date: { type: String, required: true },
  status: { type: String, default: 'pending' },
  address: {
    type: Object,
    default: {},
  },
});

module.exports = mongoose.model('Order', orderSchema);
