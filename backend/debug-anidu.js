const mongoose = require('mongoose');
require('dotenv').config();
const Schedule = require('./models/Schedule');
const Doctor = require('./models/Doctor');
const User = require('./models/User');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({ name: /Anidu/i });
  console.log('Users found:', users.map(u => ({ id: u._id, name: u.name })));
  
  for (const u of users) {
    const doctor = await Doctor.findOne({ user: u._id });
    if (doctor) {
      console.log('Doctor ID for', u.name, 'is', doctor._id);
      const schedules = await Schedule.find({ doctor: doctor._id });
      console.log('Schedules count:', schedules.length);
      schedules.forEach(s => {
        console.log(` - ${s.dayOfWeek} ${s.startTime} (${s.date})`);
      });
    }
  }
  process.exit();
}
check();
