const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Room = require('./models/Room');
const Schedule = require('./models/Schedule');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB...');

  // 1. Find or create Dr. Anidu
  let user = await User.findOne({ name: /Anidu/i });
  if (!user) {
    user = await User.create({
      name: 'Dr. Anidu Pathirana',
      email: 'anidu@clinic.com',
      password: 'password123',
      role: 'DOCTOR',
      phone: '0711222333',
      nic: '901234567V',
      age: 45,
      gender: 'MALE'
    });
  }

  let doctor = await Doctor.findOne({ user: user._id });
  if (!doctor) {
    doctor = await Doctor.create({
      user: user._id,
      experienceYears: 15,
      specialization: 'CARDIOLOGY',
      consultantFee: 2500,
      primaryHospital: 'General Hospital'
    });
  }

  // 2. Find or create a Room
  let room = await Room.findOne({ specialization: 'CARDIOLOGY' });
  if (!room) {
    room = await Room.create({
      name: 'Cardio Suite 01',
      location: 'Floor 2, Wing A',
      specialization: 'CARDIOLOGY',
      capacity: 10
    });
  }

  // 3. Clear existing schedules for this doctor to avoid duplicates
  await Schedule.deleteMany({ doctor: doctor._id });

  // 4. Create explicit sessions for Wed Apr 8 and Fri Apr 10
  const sess1 = await Schedule.create({
    doctor: doctor._id,
    room: room._id,
    dayOfWeek: 'Wednesday',
    startTime: '08:00',
    endTime: '10:00',
    timeBlock: '08:00 - 10:00',
    date: '2026-04-08'
  });

  const sess2 = await Schedule.create({
    doctor: doctor._id,
    room: room._id,
    dayOfWeek: 'Friday',
    startTime: '18:00',
    endTime: '20:00',
    timeBlock: '18:00 - 20:00',
    date: '2026-04-10'
  });

  console.log('Successfully seeded specific sessions for Dr. Anidu:');
  console.log('- Wed 2026-04-08');
  console.log('- Fri 2026-04-10');
  
  process.exit();
}
seed();
