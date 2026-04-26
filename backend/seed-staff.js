const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedStaff = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('CONNECTED TO DATABASE FOR STAFF SEEDING');

        const nurses = [
            { name: 'Sr. Maria Silva', email: 'maria@clinic.com', phone: '0711111111', nic: '701234567V', password: 'password123', role: 'NURSE' },
            { name: 'Nurse Wilson Perera', email: 'wilson@clinic.com', phone: '0712222222', nic: '851234567V', password: 'password123', role: 'NURSE' },
            { name: 'Head Nurse Kumara', email: 'kumara@clinic.com', phone: '0713333333', nic: '881234567V', password: 'password123', role: 'NURSE' },
            { name: 'Nurse Anjali Dias', email: 'anjali@clinic.com', phone: '0714444444', nic: '921234567V', password: 'password123', role: 'NURSE' },
            { name: 'General Nurse Mendis', email: 'mendis@clinic.com', phone: '0715555555', nic: '951234567V', password: 'password123', role: 'NURSE' }
        ];

        const attendants = [
            { name: 'James Fernando', email: 'james@clinic.com', phone: '0771111111', nic: '901234567V', password: 'password123', role: 'ATTENDANT' },
            { name: 'Robert Gunaratne', email: 'robert@clinic.com', phone: '0772222222', nic: '821234567V', password: 'password123', role: 'ATTENDANT' },
            { name: 'Attendant Susantha', email: 'susanth@clinic.com', phone: '0773333333', nic: '841234567V', password: 'password123', role: 'ATTENDANT' },
            { name: 'Samath Wickrama', email: 'samath@clinic.com', phone: '0774444444', nic: '881234567X', password: 'password123', role: 'ATTENDANT' },
            { name: 'Malith Jayawardena', email: 'malith@clinic.com', phone: '0775555555', nic: '951234567X', password: 'password123', role: 'ATTENDANT' }
        ];

        console.log('Clearing old staff from user directory...');
        await User.deleteMany({ role: { $in: ['NURSE', 'ATTENDANT'] } });

        console.log('Adding 5 Nurses and 5 Attendants...');
        await User.insertMany([...nurses, ...attendants]);

        console.log('STAFF SEEDING COMPLETE! 10 new staff members added.');
        process.exit();
    } catch (error) {
        console.error('SEEDING ERROR:', error);
        process.exit(1);
    }
};

seedStaff();
