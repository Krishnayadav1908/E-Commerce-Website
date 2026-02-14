const mongoose = require('mongoose');

const adminActivitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    meta: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminActivity', adminActivitySchema);
