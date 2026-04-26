const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  specialization: { 
    type: String, 
    required: true
  },
  capacity: {
    type: Number,
    default: 20
  },

  nurses: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  attendants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
}, { timestamps: true });

roomSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Room', roomSchema);
