const mongoose = require('mongoose');

const registeredPatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nic: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  age: { type: Number },
  gender: { type: String },
  address: { type: String },
  medicalHistory: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('RegisteredPatient', registeredPatientSchema);
