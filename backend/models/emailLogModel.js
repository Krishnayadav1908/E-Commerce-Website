const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    text: { type: String, default: '' },
    html: { type: String, default: '' },
    status: {
      type: String,
      enum: ['success', 'failed', 'skipped'],
      required: true
    },
    error: { type: String, default: '' },
    messageId: { type: String, default: '' },
    type: { type: String, default: '' },
    relatedId: { type: String, default: '' },
    meta: { type: Object, default: {} },
    provider: { type: String, default: 'nodemailer' },
    retryOf: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailLog', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailLog', emailLogSchema);
