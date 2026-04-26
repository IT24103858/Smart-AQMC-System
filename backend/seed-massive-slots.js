const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Room = require('./models/Room');
const Schedule = require('./models/Schedule');
require('dotenv').config({ path: './backend/.env' });

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_BLOCKS = [
    { start: '08:00', end: '10:00', label: '08:00 - 10:00' },
    { start: '10:00', end: '12:00', label: '10:00 - 12:00' },
    { start: '13:00', end: '15:00', label: '13:00 - 15:00' },
    { start: '15:00', end: '17:00', label: '15:00 - 17:00' },
];

function getDateForRange(dayOffset) {
    const today = new Date();
    const result = new Date(today);
    result.setDate(today.getDate() + dayOffset);
    return result.toISOString().split('T')[0];
}

async function seedMassiveSlots() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('CONNECTED TO DB FOR MASSIVE BOOKING SLOTS SEEDING');

        const doctors = await Doctor.find().populate('user');
        const rooms = await Room.find();

        if (doctors.length === 0 || rooms.length === 0) {
            console.error('MISSING DOCTORS OR ROOMS.');
            process.exit(1);
        }

        let createdCount = 0;
        let skippedCount = 0;

        // Iterate through all 10 doctors
        for (const dr of doctors) {
            const matchingRoom = rooms.find(r => r.specialization === dr.specialization) || rooms[0];
            
            // For each of the next 7 days
            for (let i = 0; i < 7; i++) {
                const dateStr = getDateForRange(i);
                const d = new Date(dateStr);
                const dayName = d.toLocaleString('default', { weekday: 'long' });

                // Create 2 random slots for this doctor on this day
                const shuffledBlocks = [...TIME_BLOCKS].sort(() => 0.5 - Math.random());
                const dailyBlocks = shuffledBlocks.slice(0, 2);

                for (const block of dailyBlocks) {
                    try {
                        await Schedule.create({
                            doctor: dr._id,
                            room: matchingRoom._id,
                            dayOfWeek: dayName,
                            startTime: block.start,
                            endTime: block.end,
                            timeBlock: block.label,
                            date: dateStr,
                            enrolledPatients: []
                        });
                        createdCount++;
                    } catch (e) {
                        skippedCount++;
                    }
                }
            }
            console.log(`✅ Processed slots for Dr. ${dr.user.name}`);
        }

        console.log(`\n🎉 MASSIVE SEEDING COMPLETE!`);
        console.log(`   Slots Created: ${createdCount}`);
        console.log(`   Conflicts Skipped: ${skippedCount}`);
        process.exit();
    } catch (err) {
        console.error('SEEDING ERROR:', err);
        process.exit(1);
    }
}

seedMassiveSlots();
