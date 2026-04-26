const mongoose = require('mongoose');
const Room = require('./models/Room');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project2';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');

  // Clear existing rooms
  await Room.deleteMany({});
  console.log('Cleared existing rooms.');

  const roomsToSeed = [
    { name: 'Room 101', specialization: 'Cardiology' },
    { name: 'Room 102', specialization: 'Neurology' },
    { name: 'Room 103', specialization: 'General Physician' },
    { name: 'Room 104', specialization: 'Pediatrics' },
    { name: 'Room 105', specialization: 'Oncology' },
    { name: 'Room 106', specialization: 'Orthopedics' },
    { name: 'Room 107', specialization: 'ENT' },
    { name: 'Room 201', specialization: 'Dental' },
    { name: 'Room 202', specialization: 'Radiology' },
    { name: 'Room 203', specialization: 'Psychiatry' },
    { name: 'Room 204', specialization: 'Dermatology' },
    { name: 'Room 205', specialization: 'Ophthalmology' },
    { name: 'Room 206', specialization: 'Gynaecology' },
    // Doubled Rooms (300/400 Block)
    { name: 'Room 301', specialization: 'Cardiology' },
    { name: 'Room 302', specialization: 'Neurology' },
    { name: 'Room 303', specialization: 'General Physician' },
    { name: 'Room 304', specialization: 'Pediatrics' },
    { name: 'Room 305', specialization: 'Oncology' },
    { name: 'Room 306', specialization: 'Orthopedics' },
    { name: 'Room 307', specialization: 'ENT' },
    { name: 'Room 401', specialization: 'Dental' },
    { name: 'Room 402', specialization: 'Radiology' },
    { name: 'Room 403', specialization: 'Psychiatry' },
    { name: 'Room 404', specialization: 'Dermatology' },
    { name: 'Room 405', specialization: 'Ophthalmology' },
    { name: 'Room 406', specialization: 'Gynaecology' }
  ];

  for (const roomData of roomsToSeed) {
    const existingRoom = await Room.findOne({ name: roomData.name });
    if (existingRoom) {
      console.log(`${roomData.name} already exists.`);
    } else {
      const room = new Room(roomData);
      await room.save();
      console.log(`Created: ${roomData.name} (${roomData.specialization})`);
    }
  }

  console.log('Room seeding complete!');
  mongoose.connection.close();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
