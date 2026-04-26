const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const DoctorAvailability = require('./models/DoctorAvailability');
const Room = require('./models/Room');
const Schedule = require('./models/Schedule');
const Prescription = require('./models/Prescription');
const Meeting = require('./models/Meeting');
const MedicalRecord = require('./models/MedicalRecord');
const Patient = require('./models/Patient');
const RegisteredPatient = require('./models/RegisteredPatient');
const Counter = require('./models/Counter');
require('dotenv').config();

const clearAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all non-admin users
    const usersResult = await User.deleteMany({ role: { $ne: 'ADMIN' } });
    console.log(`🗑️  Deleted ${usersResult.deletedCount} non-admin users`);

    await Doctor.deleteMany({});
    await DoctorAvailability.deleteMany({});
    await Room.deleteMany({});
    await Schedule.deleteMany({});
    await Prescription.deleteMany({});
    await Meeting.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Patient.deleteMany({});
    await RegisteredPatient.deleteMany({});
    await Counter.deleteMany({});

    console.log('🗑️  All other hospital data collections cleared.');

    // Confirm admin is still there
    const admin = await User.findOne({ role: 'ADMIN' });
    if (admin) {
      console.log(`\n✅ Admin preserved: ${admin.name} (${admin.email})`);
    } else {
      console.log('\n⚠️  No admin user found!');
    }

    console.log('\n🎉 Database cleared — only admin data remains.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

clearAll();
