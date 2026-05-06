const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  tokenId: { type: String, required: true, unique: true },
  registeredPatientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  unit: { 
    type: String, 
    enum: ['Normal', 'OPD-Normal', 'OPD-Urgent', 'Critical', 'Booked'], 
    default: 'Normal' 
  },
  severity: { 
    type: String, 
    enum: ['Critical', 'Urgent', 'Normal'], 
    default: 'Normal' 
  },
  score: { 
    type: Number, 
    default: 0 
  },
  delayReason: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['waiting', 'called', 'skipped', 'delayed', 'removed'], 
    default: 'waiting' 
  },
  checkInTime: { type: Date, default: Date.now },
  calledTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
