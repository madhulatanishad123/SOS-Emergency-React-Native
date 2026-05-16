const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'resolved', 'cancelled', 'pending'], default: 'active' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  triggerType: { type: String, enum: ['manual', 'shake', 'voice', 'ai'], default: 'manual' },
  resolvedAt: Date,
  message: String
}, { timestamps: true });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
