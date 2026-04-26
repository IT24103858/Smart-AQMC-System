const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const DoctorAvailability = require('./models/DoctorAvailability');
require('dotenv').config();

const doctorsData = [
    { name: 'Dr. John Smith', email: 'smith@hospital.com', role: 'DOCTOR', spec: 'Cardiology', fee: 2500 },
    { name: 'Dr. Sarah White', email: 'white@hospital.com', role: 'DOCTOR', spec: 'Pediatrics', fee: 2000 },
    { name: 'Dr. James Adams', email: 'adams@hospital.com', role: 'DOCTOR', spec: 'Neurology', fee: 3000 },
    { name: 'Dr. David Brown', email: 'brown@hospital.com', role: 'DOCTOR', spec: 'Dental', fee: 1500 },
    { name: 'Dr. Maria Garcia', email: 'garcia@hospital.com', role: 'DOCTOR', spec: 'Cardiology', fee: 2800 },
    { name: 'Dr. Linda Taylor', email: 'taylor@hospital.com', role: 'DOCTOR', spec: 'Oncology', fee: 3500 },
    { name: 'Dr. Robert Wilson', email: 'wilson_dr@hospital.com', role: 'DOCTOR', spec: 'Neurology', fee: 3200 },
    { name: 'Dr. Susan Lee', email: 'lee@hospital.com', role: 'DOCTOR', spec: 'Pediatrics', fee: 2200 },
    { name: 'Dr. Kevin Chen', email: 'chen@hospital.com', role: 'DOCTOR', spec: 'Dental', fee: 1800 },
    { name: 'Dr. Laura Green', email: 'green@hospital.com', role: 'DOCTOR', spec: 'Oncology', fee: 4000 }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const seedDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('CONNECTED TO DATABASE FOR DOCTOR EXPANSION');

        // Clear existing
        await DoctorAvailability.deleteMany({});
        await Doctor.deleteMany({});
        await User.deleteMany({ role: 'DOCTOR' });

        for (let i = 0; i < doctorsData.length; i++) {
            const d = doctorsData[i];
            
            // Create User
            const user = await User.create({
                name: d.name,
                email: d.email,
                phone: `07${i}${i}${i}${i}${i}${i}${i}${i}`,
                nic: `DX${80 + i}123456V`, // Unique NIC
                password: 'password123',
                role: 'DOCTOR'
            });

            // Create Doctor
            const doctor = await Doctor.create({
                user: user._id,
                experienceYears: 5 + i,
                specialization: d.spec,
                consultantFee: d.fee,
                primaryHospital: 'General Hospital'
            });

            // DISTRIBUTE SHIFTS: Pick 3 days for each doctor
            const shuffledDays = [...DAYS].sort(() => 0.5 - Math.random());
            const selectedDays = shuffledDays.slice(0, 3);

            // Stagger start times based on doctor index to ensure spread
            // Multiplier helps push doctors into afternoon/evening slots
            const timeWindows = [
                { start: '08:00', end: '12:00' }, // Morning
                { start: '12:00', end: '16:00' }, // Afternoon
                { start: '16:00', end: '20:00' }, // Evening
                { start: '18:00', end: '22:00' }  // Late Night
            ];

            for (let j = 0; j < selectedDays.length; j++) {
                const day = selectedDays[j];
                // Rotate windows based on doctor index + day index
                const windowIndex = (i + j) % timeWindows.length;
                const window = timeWindows[windowIndex];

                await DoctorAvailability.create({
                    doctor: doctor._id,
                    dayOfWeek: day,
                    startTime: window.start,
                    endTime: window.end
                });
            }
        }


        console.log('DOCTOR EXPANSION COMPLETE! 10 new doctors with full shifts added.');
        process.exit();
    } catch (error) {
        console.error('DOCTOR SEEDING ERROR:', error);
        process.exit(1);
    }
};

seedDoctors();
