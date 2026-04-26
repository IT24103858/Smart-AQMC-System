const mongoose = require('mongoose');
require('dotenv').config();

const Doctor = require('./models/Doctor');
const Schedule = require('./models/Schedule');
const User = require('./models/User');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const brownUser = await User.findOne({ name: 'Dr. David Brown' });
        if (!brownUser) {
            console.log('Dr. David Brown user not found');
            process.exit();
        }
        
        const brownDoc = await Doctor.findOne({ user: brownUser._id });
        if (!brownDoc) {
            console.log('Dr. David Brown doctor record not found');
            process.exit();
        }
        
        console.log(`Doctor ID: ${brownDoc._id}`);
        
        const sessions = await Schedule.find({ doctor: brownDoc._id });
        console.log(`Found ${sessions.length} sessions for Dr. Brown:`);
        sessions.forEach(s => {
            console.log(`- Date: ${s.date}, Day: ${s.dayOfWeek}, Block: ${s.timeBlock}`);
        });
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
debug();
