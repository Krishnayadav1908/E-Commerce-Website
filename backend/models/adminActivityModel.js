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

// Add indexes for faster queries
adminActivitySchema.index({ actor: 1, createdAt: -1 });
adminActivitySchema.index({ targetType: 1 });
adminActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminActivity', adminActivitySchema);
