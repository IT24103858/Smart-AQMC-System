const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  experienceYears: { type: Number, required: true },
  specialization: { type: String, required: true },
  consultantFee: { type: Number, required: true },
  primaryHospital: { type: String, required: true }
}, { timestamps: true });

doctorSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
