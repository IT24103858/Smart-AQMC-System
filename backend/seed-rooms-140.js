const mongoose = require('mongoose');
const Room = require('./models/Room');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const specializations = [
    'Cardiology', 'Neurology', 'General Physician', 'Pediatrics', 
    'Oncology', 'Orthopedics', 'ENT', 'Dental', 
    'Radiology', 'Psychiatry', 'Dermatology', 'Ophthalmology', 'Gynaecology'
];

const seedRooms = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing rooms
        await Room.deleteMany({});
        console.log('🧹 Cleared existing rooms.');

        const roomsToCreate = [];
        for (let i = 101; i <= 140; i++) {
            const specIndex = (i - 101) % specializations.length;
            roomsToCreate.push({
                name: `Room ${i}`,
                specialization: specializations[specIndex],
                capacity: 20
            });
        }

        await Room.insertMany(roomsToCreate);
        console.log(`🏢 Created 40 rooms from Room 101 to Room 140.`);

        console.log('\n🎉 Room seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding rooms:', err);
        process.exit(1);
    }
};

seedRooms();
