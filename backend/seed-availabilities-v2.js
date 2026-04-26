const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const DoctorAvailability = require('./models/DoctorAvailability');
require('dotenv').config();

const availabilityData = [
    {
        name: 'Dr. Nimal Jayasinghe',
        slots: [
            { day: 'Tuesday', start: '18:00', end: '21:00' },
            { day: 'Thursday', start: '08:00', end: '11:00' },
            { day: 'Saturday', start: '13:00', end: '16:00' }
        ]
    },
    {
        name: 'Dr. Ruwan Wickramasinghe',
        slots: [
            { day: 'Monday', start: '18:00', end: '21:00' },
            { day: 'Thursday', start: '13:00', end: '16:00' },
            { day: 'Sunday', start: '08:00', end: '11:00' }
        ]
    },
    {
        name: 'Dr. Dilani Perera',
        slots: [
            { day: 'Tuesday', start: '13:00', end: '16:00' },
            { day: 'Friday', start: '08:00', end: '11:00' },
            { day: 'Sunday', start: '18:00', end: '21:00' }
        ]
    },
    {
        name: 'Dr. Pradeep Kumara',
        slots: [
            { day: 'Monday', start: '08:00', end: '11:00' },
            { day: 'Wednesday', start: '13:00', end: '16:00' },
            { day: 'Friday', start: '18:00', end: '21:00' }
        ]
    },
    {
        name: 'Dr. Malini Jayawardena',
        slots: [
            { day: 'Tuesday', start: '18:00', end: '21:00' },
            { day: 'Thursday', start: '08:00', end: '11:00' },
            { day: 'Saturday', start: '13:00', end: '16:00' }
        ]
    },
    {
        name: 'Dr. Saman Wijesinghe',
        slots: [
            { day: 'Monday', start: '13:00', end: '16:00' },
            { day: 'Wednesday', start: '18:00', end: '21:00' },
            { day: 'Sunday', start: '08:00', end: '11:00' }
        ]
    },
    {
        name: 'Dr. Chamara Silva',
        slots: [
            { day: 'Tuesday', start: '08:00', end: '11:00' },
            { day: 'Thursday', start: '18:00', end: '21:00' },
            { day: 'Saturday', start: '13:00', end: '16:00' }
        ]
    },
    {
        name: 'Dr. Ishara Perera',
        slots: [
            { day: 'Monday', start: '08:00', end: '11:00' },
            { day: 'Friday', start: '13:00', end: '16:00' },
            { day: 'Sunday', start: '18:00', end: '21:00' }
        ]
    },
    {
        name: 'Dr. Shalini Fernando',
        slots: [
            { day: 'Tuesday', start: '13:00', end: '16:00' },
            { day: 'Thursday', start: '08:00', end: '11:00' },
            { day: 'Saturday', start: '18:00', end: '21:00' }
        ]
    },
    {
        name: 'Dr. Tharindu Senanayake',
        slots: [
            { day: 'Wednesday', start: '13:00', end: '16:00' },
            { day: 'Friday', start: '08:00', end: '11:00' },
            { day: 'Sunday', start: '18:00', end: '21:00' }
        ]
    },
    {
        name: 'Dr. Anidu Pathirana',
        slots: [
            { day: 'Monday', start: '13:00', end: '16:00' },
            { day: 'Wednesday', start: '08:00', end: '11:00' },
            { day: 'Friday', start: '18:00', end: '21:00' }
        ]
    },
    {
        name: 'Dr. Kasuni Rodrigo',
        slots: [
            { day: 'Tuesday', start: '08:00', end: '11:00' },
            { day: 'Thursday', start: '13:00', end: '16:00' },
            { day: 'Saturday', start: '18:00', end: '21:00' }
        ]
    },
    {
        name: 'Dr. Hiruni De Silva',
        slots: [
            { day: 'Monday', start: '18:00', end: '21:00' },
            { day: 'Wednesday', start: '13:00', end: '16:00' },
            { day: 'Sunday', start: '08:00', end: '11:00' }
        ]
    },
    {
        name: 'Dr. Sunil Karunaratne',
        slots: [
            { day: 'Tuesday', start: '18:00', end: '21:00' },
            { day: 'Friday', start: '08:00', end: '11:00' },
            { day: 'Sunday', start: '13:00', end: '16:00' }
        ]
    },
    {
        name: 'Dr. Kasun Perera',
        slots: [
            { day: 'Monday', start: '08:00', end: '11:00' },
            { day: 'Thursday', start: '13:00', end: '16:00' },
            { day: 'Saturday', start: '18:00', end: '21:00' }
        ]
    },
    {
        name: 'Dr. Nadeeja Seneviratne',
        slots: [
            { day: 'Wednesday', start: '08:00', end: '11:00' },
            { day: 'Friday', start: '13:00', end: '16:00' },
            { day: 'Sunday', start: '18:00', end: '21:00' }
        ]
    },
    {
        name: 'Dr. Ramesh Fernando',
        slots: [
            { day: 'Tuesday', start: '13:00', end: '16:00' },
            { day: 'Thursday', start: '08:00', end: '11:00' },
            { day: 'Saturday', start: '18:00', end: '21:00' }
        ]
    }
];

const seedAvailabilities = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        for (const data of availabilityData) {
            // Find user by name
            const user = await User.findOne({ name: data.name });
            if (!user) {
                console.log(`❌ User not found: ${data.name}`);
                continue;
            }

            // Find doctor profile
            const doctor = await Doctor.findOne({ user: user._id });
            if (!doctor) {
                console.log(`❌ Doctor profile not found for: ${data.name}`);
                continue;
            }

            // Clear existing availability for this doctor to avoid duplicates
            await DoctorAvailability.deleteMany({ doctor: doctor._id });
            console.log(`🧹 Cleared old availability for: ${data.name}`);

            // Add new slots
            for (const slot of data.slots) {
                await DoctorAvailability.create({
                    doctor: doctor._id,
                    dayOfWeek: slot.day,
                    startTime: slot.start,
                    endTime: slot.end,
                    patientLimit: 20
                });
            }
            console.log(`📅 Added ${data.slots.length} slots for: ${data.name}`);
        }

        console.log('\n🎉 Availability seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding availability:', err);
        process.exit(1);
    }
};

seedAvailabilities();
