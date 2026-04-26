const mongoose = require('mongoose');

const doctorAvailabilitySchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  patientLimit: { type: Number, default: 20 },
  isBooked: { type: Boolean, default: false }
}, { timestamps: true });

doctorAvailabilitySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
