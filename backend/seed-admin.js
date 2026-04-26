const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clinic_db';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');

  // Check if admin already exists
  const existingAdmin = await User.findOne({ email: 'admin@medicare.com' });

  if (existingAdmin) {
    console.log('Admin user already exists!');
  } else {
    // Create new admin user
    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@medicare.com',
      password: 'admin123',
      phone: '0000000000',
      nic: 'ADM-000001',
      role: 'ADMIN',
      status: 'active',
      age: 30,
      gender: 'Male'
    });

    await adminUser.save();
    console.log('Admin user successfully created!');
  }

  mongoose.connection.close();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
