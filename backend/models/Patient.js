const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  tokenId: { type: String, required: true, unique: true },
  registeredPatientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RegisteredPatient', 
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['Urgent', 'Normal'], 
    default: 'Normal' 
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
