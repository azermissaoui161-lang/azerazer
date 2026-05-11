const mongoose = require('mongoose');

const depenseSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'global',
    unique: true,
    immutable: true,
  },
  maxMonthlyAmount: {
    type: Number,
    default: 0,
    min: [0, 'La limite mensuelle ne peut pas etre negative'],
  },
  warningThresholdPercent: {
    type: Number,
    default: 80,
    min: [1, 'Le seuil doit etre superieur a 0'],
    max: [100, 'Le seuil ne peut pas depasser 100'],
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

depenseSettingsSchema.statics.getGlobal = async function() {
  let settings = await this.findOne({ key: 'global' });

  if (!settings) {
    settings = await this.create({ key: 'global' });
  }

  return settings;
};

module.exports = mongoose.model('DepenseSettings', depenseSettingsSchema);
