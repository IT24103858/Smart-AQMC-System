const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Room = require('./models/Room');
const Schedule = require('./models/Schedule');
const Prescription = require('./models/Prescription');
require('dotenv').config({ path: './backend/.env' });

const patientsData = [
  { name: 'Alice Johnson',    email: 'alice@patient.com',   phone: '0711111111', nic: 'PT001234V', age: 34, gender: 'Female' },
  { name: 'Bob Martinez',     email: 'bob@patient.com',     phone: '0722222222', nic: 'PT002234V', age: 45, gender: 'Male'   },
  { name: 'Carol Williams',   email: 'carol@patient.com',   phone: '0733333333', nic: 'PT003234V', age: 28, gender: 'Female' },
  { name: 'David Thompson',   email: 'david@patient.com',   phone: '0744444444', nic: 'PT004234V', age: 60, gender: 'Male'   },
  { name: 'Emily Davis',      email: 'emily@patient.com',   phone: '0755555555', nic: 'PT005234V', age: 22, gender: 'Female' },
  { name: 'Frank Wilson',     email: 'frank@patient.com',   phone: '0766666666', nic: 'PT006234V', age: 52, gender: 'Male'   },
  { name: 'Grace Moore',      email: 'grace@patient.com',   phone: '0777777777', nic: 'PT007234V', age: 38, gender: 'Female' },
  { name: 'Henry Anderson',   email: 'henry@patient.com',   phone: '0788888888', nic: 'PT008234V', age: 47, gender: 'Male'   },
  { name: 'Irene Jackson',    email: 'irene@patient.com',   phone: '0799999999', nic: 'PT009234V', age: 30, gender: 'Female' },
  { name: 'James White',      email: 'james@patient.com',   phone: '0710101010', nic: 'PT010234V', age: 55, gender: 'Male'   },
  { name: 'Karen Harris',     email: 'karen@patient.com',   phone: '0711010101', nic: 'PT011234V', age: 41, gender: 'Female' },
  { name: 'Leo Clark',        email: 'leo@patient.com',     phone: '0712020202', nic: 'PT012234V', age: 67, gender: 'Male'   },
  { name: 'Mia Lewis',        email: 'mia@patient.com',     phone: '0713030303', nic: 'PT013234V', age: 19, gender: 'Female' },
  { name: 'Nathan Robinson',  email: 'nathan@patient.com',  phone: '0714040404', nic: 'PT014234V', age: 33, gender: 'Male'   },
  { name: 'Olivia Walker',    email: 'olivia@patient.com',  phone: '0715050505', nic: 'PT015234V', age: 50, gender: 'Female' },
];

const diagnoses = [
  { diagnosis: 'Hypertension', medications: 'Amlodipine 5mg once daily', instructions: 'Avoid salty food, monitor BP daily', followUp: '2 weeks' },
  { diagnosis: 'Type 2 Diabetes', medications: 'Metformin 500mg twice daily', instructions: 'Low carb diet, exercise 30 min daily', followUp: '1 month' },
  { diagnosis: 'Common Cold & Flu', medications: 'Paracetamol 500mg every 6 hrs, Cetirizine 10mg at night', instructions: 'Rest and drink plenty of fluids', followUp: 'none' },
  { diagnosis: 'Migraine', medications: 'Sumatriptan 50mg as needed, Ibuprofen 400mg', instructions: 'Avoid bright lights and stress triggers', followUp: '1 month' },
  { diagnosis: 'Acute Gastritis', medications: 'Omeprazole 20mg before meals, Antacid syrup', instructions: 'Avoid spicy and oily food', followUp: '2 weeks' },
  { diagnosis: 'Anemia', medications: 'Ferrous Sulphate 200mg twice daily', instructions: 'Take with Vitamin C, avoid tea/coffee with meals', followUp: '1 month' },
  { diagnosis: 'Anxiety Disorder', medications: 'Escitalopram 10mg once daily', instructions: 'Practice breathing exercises, avoid caffeine', followUp: '2 weeks' },
  { diagnosis: 'Dental Caries', medications: 'Amoxicillin 500mg 3x daily, Ibuprofen 400mg for pain', instructions: 'Avoid sweet foods, brush twice daily', followUp: '1 week' },
];

// Days of next week from today
function getNextWeekDate(dayName) {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today = new Date();
  const todayDay = today.getDay();
  const targetDay = days.indexOf(dayName);
  let diff = targetDay - todayDay;
  if (diff <= 0) diff += 7;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return result.toISOString().split('T')[0];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_BLOCKS = [
  { startTime: '08:00', endTime: '10:00', timeBlock: '08:00 - 10:00' },
  { startTime: '10:00', endTime: '12:00', timeBlock: '10:00 - 12:00' },
  { startTime: '13:00', endTime: '15:00', timeBlock: '13:00 - 15:00' },
  { startTime: '15:00', endTime: '17:00', timeBlock: '15:00 - 17:00' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ── 1. Clear old patient/session/prescription data ──────────────────────
    await Prescription.deleteMany({});
    await Schedule.deleteMany({});
    await User.deleteMany({ role: 'PATIENT' });
    console.log('🗑️  Cleared old patients, schedules & prescriptions');

    // ── 2. Create patient users ──────────────────────────────────────────────
    const patients = [];
    for (const p of patientsData) {
      const patient = await User.create({
        name: p.name,
        email: p.email,
        phone: p.phone,
        nic: p.nic,
        password: 'patient123',
        role: 'PATIENT',
        age: p.age,
        gender: p.gender,
        status: 'active'
      });
      patients.push(patient);
    }
    console.log(`👥 Created ${patients.length} patients`);

    // ── 3. Fetch doctors & rooms ─────────────────────────────────────────────
    const doctors = await Doctor.find({});
    const rooms   = await Room.find({});
    if (doctors.length === 0) { console.error('❌ No doctors found! Run seed-doctors-expanded.js first.'); process.exit(1); }
    if (rooms.length   === 0) { console.error('❌ No rooms found! Run seed-rooms.js first.'); process.exit(1); }

    // ── 4. Create schedules (sessions) and enroll patients ───────────────────
    const schedules = [];
    let patientIndex = 0;

    for (let d = 0; d < doctors.length; d++) {
      const doctor = doctors[d];
      const room   = rooms[d % rooms.length];

      // Create 2 sessions per doctor on different days
      for (let s = 0; s < 2; s++) {
        const day       = DAYS[(d * 2 + s) % DAYS.length];
        const block     = TIME_BLOCKS[(d + s) % TIME_BLOCKS.length];
        const dateStr   = getNextWeekDate(day);

        // Check for conflicts before inserting
        const exists = await Schedule.findOne({
          $or: [
            { doctor: doctor._id, dayOfWeek: day, timeBlock: block.timeBlock },
            { room: room._id,     dayOfWeek: day, timeBlock: block.timeBlock }
          ]
        });
        if (exists) {
          console.log(`⚠️  Skipping duplicate: ${day} ${block.timeBlock}`);
          continue;
        }

        // Pick 2-3 patients for this session (cycling through the list)
        const enrolledIds = [];
        for (let e = 0; e < 3; e++) {
          enrolledIds.push(patients[patientIndex % patients.length]._id);
          patientIndex++;
        }

        const schedule = await Schedule.create({
          doctor:           doctor._id,
          room:             room._id,
          dayOfWeek:        day,
          startTime:        block.startTime,
          endTime:          block.endTime,
          timeBlock:        block.timeBlock,
          date:             dateStr,
          enrolledPatients: enrolledIds
        });

        schedules.push({ schedule, enrolledIds, doctor });
        console.log(`📅 Session created: ${day} ${block.timeBlock} | Doctor ${d + 1} | ${enrolledIds.length} patients`);
      }
    }

    // ── 5. Create prescriptions for enrolled patients ────────────────────────
    let prescCount = 0;
    for (const { schedule, enrolledIds, doctor } of schedules) {
      for (let i = 0; i < enrolledIds.length; i++) {
        const rx = diagnoses[(prescCount) % diagnoses.length];
        await Prescription.create({
          doctor:       doctor._id,
          patient:      enrolledIds[i],
          session:      schedule._id,
          diagnosis:    rx.diagnosis,
          medications:  rx.medications,
          instructions: rx.instructions,
          followUp:     rx.followUp,
          date:         new Date()
        });
        prescCount++;
      }
    }
    console.log(`💊 Created ${prescCount} prescriptions`);

    console.log('\n🎉 PATIENT & SESSION SEEDING COMPLETE!');
    console.log(`   Patients   : ${patients.length}`);
    console.log(`   Sessions   : ${schedules.length}`);
    console.log(`   Prescriptions: ${prescCount}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ SEEDING ERROR:', err);
    process.exit(1);
  }
};

seed();
