const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  recordType: {
    type: String,
    enum: ['PAST_REPORT', 'PRESCRIPTION'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  filePath: {
    type: String // Used for PAST_REPORT (uploads/reports/...)
  },
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription' // Link to the Prescription record if it's a prescription
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
