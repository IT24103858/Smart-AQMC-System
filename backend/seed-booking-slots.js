const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Room = require('./models/Room');
const Schedule = require('./models/Schedule');
require('dotenv').config();

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_BLOCKS = [
    { start: '08:00', end: '10:00', label: '08:00 - 10:00' },
    { start: '10:00', end: '12:00', label: '10:00 - 12:00' },
    { start: '13:00', end: '15:00', label: '13:00 - 15:00' },
    { start: '15:00', end: '17:00', label: '15:00 - 17:00' },
];

function getDateForDay(dayName) {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = new Date();
    const todayDay = today.getDay();
    const targetDay = days.indexOf(dayName);
    let diff = targetDay - todayDay;
    if (diff < 0) diff += 7; // This week or next week? Let's aim for this week's occurrences.
    const result = new Date(today);
    result.setDate(today.getDate() + diff);
    return result.toISOString().split('T')[0];
}

async function seedSlots() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('CONNECTED TO DB FOR BOOKING SLOTS SEEDING');

        const doctors = await Doctor.find().populate('user');
        const rooms = await Room.find();

        if (doctors.length === 0 || rooms.length === 0) {
            console.error('MISSING DOCTORS OR ROOMS. PLEASE RUN PREVIOUS SEEDERS FIRST.');
            process.exit(1);
        }

        let createdCount = 0;

        for (const dr of doctors) {
            // Find a room that matches specialization
            const matchingRoom = rooms.find(r => r.specialization === dr.specialization) || rooms[0];
            
            // Create 3 random slots for this doctor across the next week
            const selectedDays = [...DAYS].sort(() => 0.5 - Math.random()).slice(0, 3);
            
            for (const day of selectedDays) {
                const block = TIME_BLOCKS[Math.floor(Math.random() * TIME_BLOCKS.length)];
                const dateStr = getDateForDay(day);

                // Check for conflict
                const conflict = await Schedule.findOne({
                    date: dateStr,
                    timeBlock: block.label,
                    $or: [ { doctor: dr._id }, { room: matchingRoom._id } ]
                });

                if (!conflict) {
                    await Schedule.create({
                        doctor: dr._id,
                        room: matchingRoom._id,
                        dayOfWeek: day,
                        startTime: block.start,
                        endTime: block.end,
                        timeBlock: block.label,
                        date: dateStr,
                        enrolledPatients: [] // Empty = Available to book
                    });
                    createdCount++;
                    console.log(`✅ Slot: Dr. ${dr.user.name} | ${day} ${block.label} | ${dateStr}`);
                }
            }
        }

        console.log(`\n🎉 SEEDING COMPLETE! Created ${createdCount} booking slots.`);
        process.exit();
    } catch (err) {
        console.error('SEEDING ERROR:', err);
        process.exit(1);
    }
}

seedSlots();
