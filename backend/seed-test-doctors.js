const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const DoctorAvailability = require('./models/DoctorAvailability');
require('dotenv').config();

async function seedDoctors() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clinic_db');
  console.log('Connected to seed doctors...');

  const doctorsData = [
    { name: 'John Smith', email: 'smith@medicare.com', spec: 'Cardiology', days: ['Monday', 'Wednesday'], start: '08:00', end: '18:00' },
    { name: 'Sarah Adams', email: 'adams@medicare.com', spec: 'Neurology', days: ['Tuesday', 'Thursday'], start: '10:00', end: '20:00' },
    { name: 'Emily White', email: 'white@medicare.com', spec: 'Pediatrics', days: ['Friday', 'Saturday'], start: '08:00', end: '16:00' },
    { name: 'David Brown', email: 'brown@medicare.com', spec: 'Dental', days: ['Monday'], start: '14:00', end: '22:00' }
  ];

  for (const data of doctorsData) {
    // 1. Create or Find User
    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = await User.create({
        name: data.name,
        email: data.email,
        password: 'password123',
        role: 'DOCTOR',
        phone: '071' + Math.floor(Math.random() * 9000000 + 1000000),
        nic: 'DOC-' + Math.floor(Math.random() * 900000)
      });
      console.log(`Created User: ${data.name}`);
    }

    // 2. Create or Find Doctor Profile
    let doctor = await Doctor.findOne({ user: user._id });
    if (!doctor) {
      doctor = await Doctor.create({
        user: user._id,
        specialization: data.spec,
        experienceYears: 10,
        consultantFee: 2500,
        primaryHospital: 'General Hospital'
      });
      console.log(`Created Doctor Profile: ${data.spec}`);
    }

    // 3. Create Availabilities
    for (const day of data.days) {
      const exists = await DoctorAvailability.findOne({ doctor: doctor._id, dayOfWeek: day });
      if (!exists) {
        await DoctorAvailability.create({
          doctor: doctor._id,
          dayOfWeek: day,
          startTime: data.start,
          endTime: data.end
        });
        console.log(`Added Availability for ${data.name} on ${day} (${data.start}-${data.end})`);
      }
    }
  }

  console.log('Test Doctors and Availabilities Seeded Successfully!');
  mongoose.connection.close();
}

seedDoctors().catch(console.error);
