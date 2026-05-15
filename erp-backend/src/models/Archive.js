const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true
    },

    invoiceNumber: {
      type: String,
      required: true
    },

    customer: {
      type: String,
      default: 'Unknown'
    },

    amount: {
      type: Number,
      default: 0
    },

    reason: {
      type: String,
      default: ''
    },

    data: {
      type: Object,
      required: true
    },

    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    archivedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

//  Indexes (performance)
archiveSchema.index({ invoiceNumber: 1 });
archiveSchema.index({ archivedAt: -1 });
archiveSchema.index({ invoiceId: 1 });

module.exports = mongoose.model('Archive', archiveSchema);