const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  medications: {
    type: String,
    required: true
  },
  instructions: {
    type: String
  },
  followUp: {
    type: String,
    default: 'none'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
