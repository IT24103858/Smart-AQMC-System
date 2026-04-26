const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, default: 'Conference Room A' },
  participants: [{ 
    type: String, 
    enum: ['DOCTORS', 'NURSES', 'ALL_STAFF', 'ADMIN'],
    default: 'ALL_STAFF'
  }],
  notes: { type: String }
}, { timestamps: true });

meetingSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Meeting', meetingSchema);
