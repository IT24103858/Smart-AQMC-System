const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String,
    required: true
  }, // e.g., "08:00"
  endTime: {
    type: String,
    required: true
  },   // e.g., "10:00"
  timeBlock: {
    type: String,
    required: true
  }, // e.g., "08:00 - 10:00"
  date: {
    type: String,
    required: true
  },
  enrolledPatients: [{
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    medicalReport: {
      type: String,
      default: null
    },
    illnessDescription: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED'],
      default: 'PENDING'
    }
  }],
  patientLimit: {
    type: Number,
    default: 20
  }
}, { timestamps: true });

// Ensure a room isn't double-booked for the same time block
scheduleSchema.index({ room: 1, dayOfWeek: 1, timeBlock: 1 }, { unique: true });
// Ensure a doctor isn't double-booked for the same time block
scheduleSchema.index({ doctor: 1, dayOfWeek: 1, timeBlock: 1 }, { unique: true });

scheduleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
