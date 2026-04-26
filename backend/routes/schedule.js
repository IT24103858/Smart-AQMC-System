const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const DoctorAvailability = require('../models/DoctorAvailability');
const Doctor = require('../models/Doctor');
const Room = require('../models/Room');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/reports';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const BLOCKS = [
  { start: '08:00', end: '10:00', label: '08:00 - 10:00' },
  { start: '10:00', end: '12:00', label: '10:00 - 12:00' },
  { start: '12:00', end: '14:00', label: '12:00 - 14:00' },
  { start: '14:00', end: '16:00', label: '14:00 - 16:00' },
  { start: '16:00', end: '18:00', label: '16:00 - 18:00' },
  { start: '18:00', end: '20:00', label: '18:00 - 20:00' },
  { start: '20:00', end: '22:00', label: '20:00 - 22:00' }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Returns the ISO date string (YYYY-MM-DD) for a given day name within the
 * current ISO week (week starts on Monday).
 * e.g. getDateForDayOfWeek('Wednesday') → '2026-03-25'
 */
function getDateForDayOfWeek(dayName) {
  const dayIndex = DAYS.indexOf(dayName); // 0 = Monday … 6 = Sunday
  const today = new Date();
  // JS getDay(): 0=Sun,1=Mon,...,6=Sat  →  convert to ISO Mon=0 base
  const todayIndex = (today.getDay() + 6) % 7; // 0=Mon … 6=Sun
  const diff = dayIndex - todayIndex;
  const target = new Date(today);
  target.setDate(today.getDate() + diff);
  // Manually format as YYYY-MM-DD (toLocaleDateString is unreliable in Node.js)
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// GET full weekly schedule
router.get('/', async (req, res) => {
  try {
    const { doctorId } = req.query;
    let query = {};
    if (doctorId) {
      query.doctor = doctorId;
    }
    const schedule = await Schedule.find(query)
      .populate({
        path: 'doctor',
        populate: { path: 'user' }
      })
      .populate({
        path: 'room',
        populate: { path: 'nurses attendants' }
      });
    res.json(schedule);
  } catch (error) {

    res.status(500).json({ error: error.message });
  }
});


// GENERATE weekly timetable based on availability
router.post('/generate', async (req, res) => {
  try {
    // 1. Clear existing schedule
    await Schedule.deleteMany({});

    // DEBUG: log computed dates for all days
    console.log('--- Generated Week Dates ---');
    DAYS.forEach(d => console.log(d, '→', getDateForDayOfWeek(d)));
    console.log('----------------------------');

    // 2. Load all necessary data
    const availabilities = await DoctorAvailability.find().populate('doctor');
    const rooms = await Room.find();

    let generatedCount = 0;

    // 3. Matchmaking through Days and Blocks
    for (const day of DAYS) {
      // Track doctors already scheduled for ANY block on this day
      const scheduledDoctorsToday = new Set();

      for (const block of BLOCKS) {

        // Find all doctors available during this specific day and time block
        const availableDoctorsThisBlock = availabilities.filter(av => {
          return av.dayOfWeek === day &&
            av.startTime <= block.start &&
            av.endTime >= block.end;
        });

        const busyDoctorsInThisBlock = new Set();
        const busyRoomsInThisBlock = new Set();

        for (const av of availableDoctorsThisBlock) {
          const doctor = av.doctor;

          if (!doctor) continue;

          // DOCTOR VALIDATION: Skip if already scheduled AT ALL today or BUSY in this specific block
          if (scheduledDoctorsToday.has(doctor._id.toString()) || busyDoctorsInThisBlock.has(doctor._id.toString())) continue;

          // Find a room that matches specialization and is not busy
          const matchingRoom = rooms.find(room =>
            room.specialization === doctor.specialization &&
            !busyRoomsInThisBlock.has(room._id.toString())
          );


          if (matchingRoom) {
            try {
              // Allocate session!
              await Schedule.create({
                doctor: doctor._id,
                room: matchingRoom._id,
                dayOfWeek: day,
                startTime: block.start,
                endTime: block.end,
                timeBlock: block.label,
                date: getDateForDayOfWeek(day) // Actual date of this session's day in the current week
              });

              scheduledDoctorsToday.add(doctor._id.toString());
              busyDoctorsInThisBlock.add(doctor._id.toString());
              busyRoomsInThisBlock.add(matchingRoom._id.toString());
              generatedCount++;
            } catch (err) {
              console.error(`Failed to create schedule for ${doctor._id} in ${matchingRoom._id}:`, err.message);
            }
          }
        }
      }
    }


    console.log(`Generation finished. Created ${generatedCount} sessions.`);
    res.json({ message: `Successfully generated ${generatedCount} timetable sessions.`, count: generatedCount });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE manual session
router.post('/manual', async (req, res) => {
  try {
    const { doctor, room, dayOfWeek, startTime, endTime, timeBlock, date } = req.body;

    // VALIDATION: Room Busy Check
    const existingRoomUsage = await Schedule.findOne({
      dayOfWeek,
      timeBlock,
      room
    });

    if (existingRoomUsage) {
      return res.status(400).json({ error: 'This room is already occupied during this time block.' });
    }

    // VALIDATION: Doctor Busy Check
    const existingDoctorUsage = await Schedule.findOne({
      dayOfWeek,
      timeBlock,
      doctor
    });

    if (existingDoctorUsage) {
      return res.status(400).json({ error: 'This doctor is already scheduled for another session during this time block.' });
    }

    // NEW VALIDATION: Staff Busy Check
    const targetRoom = await Room.findById(room);
    if (!targetRoom) return res.status(404).json({ error: 'Room not found' });
    
    const staffIds = [...(targetRoom.nurses || []), ...(targetRoom.attendants || [])];
    for (const sId of staffIds) {
        const otherRoomsWithThisStaff = await Room.find({ _id: { $ne: targetRoom._id }, $or: [{ nurses: sId }, { attendants: sId }] });
        for (const oRoom of otherRoomsWithThisStaff) {
            const conflict = await Schedule.findOne({ room: oRoom._id, dayOfWeek, timeBlock });
            if (conflict) {
                const staffMember = await User.findById(sId);
                return res.status(400).json({ error: `Staff Conflict: ${staffMember.name} is already assigned to ${oRoom.name} during this time block.` });
            }
        }
    }

    const newSession = await Schedule.create({
      doctor,
      room,
      dayOfWeek,
      startTime,
      endTime,
      timeBlock,
      date
    });

    res.status(201).json(newSession);
  } catch (error) {
    console.error('Manual creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});


// GET appointment management stats (charts and lists)
router.get('/appointment-stats', async (req, res) => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Fetch all relevant sessions
    const sessions = await Schedule.find({
      date: { $gte: todayStr }
    })
    .populate({ path: 'doctor', populate: { path: 'user' } })
    .populate({ path: 'enrolledPatients.patient', select: 'name email phone nic age gender' });

    // 1. Counts for Today and Tomorrow
    const todaySessions = sessions.filter(s => s.date === todayStr);
    const tomorrowSessions = sessions.filter(s => s.date === tomorrowStr);

    const todayPatientsCount = todaySessions.reduce((acc, s) => acc + s.enrolledPatients.length, 0);
    const tomorrowPatientsCount = tomorrowSessions.reduce((acc, s) => acc + s.enrolledPatients.length, 0);

    // 2. Specialization Breakdown
    const specCounts = {};
    sessions.forEach(s => {
      if (s.doctor && s.doctor.specialization) {
        const spec = s.doctor.specialization;
        const patientCount = s.enrolledPatients.length;
        specCounts[spec] = (specCounts[spec] || 0) + patientCount;
      }
    });

    // 3. Detailed list (all upcoming appointments)
    const detailedList = [];
    sessions.forEach(s => {
      s.enrolledPatients.forEach(ep => {
        detailedList.push({
          sessionId: s._id,
          date: s.date,
          timeBlock: s.timeBlock,
          doctorName: s.doctor?.user?.name || 'Unknown',
          specialization: s.doctor?.specialization || 'N/A',
          patientName: ep.patient?.name || 'Unknown',
          patientNic: ep.patient?.nic || 'N/A',
          patientPhone: ep.patient?.phone || 'N/A',
          illness: ep.illnessDescription,
          status: ep.status || 'PENDING'
        });
      });
    });

    res.json({
      todayCount: todayPatientsCount,
      tomorrowCount: tomorrowPatientsCount,
      specializationStats: specCounts,
      detailedList: detailedList.sort((a, b) => a.date.localeCompare(b.date))
    });
  } catch (err) {
    console.error('Appointment Stats Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET unique specializations from all doctors
router.get('/specializations', async (req, res) => {
  try {
    const specializations = await Doctor.distinct('specialization');
    res.json(specializations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET available sessions filtered by specialization/doctor and date
router.get('/available', async (req, res) => {
  try {
    const { specialization, date, doctorId } = req.query;
    let query = {};
    // Handle Doctor ID to avoid type mismatches - Supporting both Doctor ID and User ID just in case
    if (doctorId && doctorId !== 'undefined' && doctorId !== 'null') {
      try {
        const oid = new mongoose.Types.ObjectId(doctorId);
        // Find if this is a User ID or Doctor ID
        const drByDocId = await Doctor.findById(oid);
        const drByUserId = await Doctor.findOne({ user: oid });
        
        if (drByDocId) {
          query.doctor = drByDocId._id;
        } else if (drByUserId) {
          query.doctor = drByUserId._id;
        } else {
          query.doctor = oid; // Fallback to raw ObjectId
        }
      } catch (err) {
        console.warn('Invalid doctorId format received:', doctorId);
        query.doctor = doctorId;
      }
    }

    const now = new Date();
    // Use local time for comparison to match current user context
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentClock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 1. Get ALL sessions for this doctor but filter out past ones for the UI dots
    const allDocSessions = await Schedule.find(query);
    const availableDates = [...new Set(allDocSessions
      .filter(s => {
        if (s.date < todayStr) return false;
        if (s.date === todayStr) return s.startTime > currentClock;
        return true;
      })
      .map(s => s.date)
    )];

    let sessions = [];
    if (date && date !== 'undefined') {
      // Direct lookup by exact date first
      sessions = await Schedule.find({ ...query, date })
        .populate({ path: 'doctor', populate: { path: 'user' } })
        .populate('room');
      
      // Fallback: If no exact date sessions found, check by day of week
      if (sessions.length === 0) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const [y, m, dNum] = date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, dNum);
        const dayName = days[dateObj.getDay()];
        
        sessions = await Schedule.find({ ...query, dayOfWeek: dayName })
          .populate({ path: 'doctor', populate: { path: 'user' } })
          .populate('room');
      }
    } else {
      // If no date, return all doctor sessions
      sessions = await Schedule.find(query)
        .populate({ path: 'doctor', populate: { path: 'user' } })
        .populate('room');
    }

    // Filter sessions to exclude past times
    sessions = sessions.filter(s => {
      if (s.date < todayStr) return false;
      if (s.date === todayStr) return s.startTime > currentClock;
      return true;
    });

    // Extra filtering for specialization if no specific doctor id provided
    if (!doctorId || doctorId === 'undefined') {
      if (specialization) {
        // Since specialization is on Doctor, we need to populate and filter
        if (sessions.length === 0) {
           sessions = await Schedule.find().populate('doctor').populate('room');
        }
        sessions = sessions.filter(s => s.doctor && s.doctor.specialization === specialization);
      }
    }
    
    res.json({
      sessions,
      availableDates,
      debug: { count: sessions.length, date, doctorId, todayStr, currentClock }
    });
  } catch (error) {
    console.error('Available Fetch Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single session with enrolled patients populated
router.get('/:id', async (req, res) => {
  try {
    const session = await Schedule.findById(req.params.id)
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'room', populate: { path: 'nurses attendants' } })
      .populate({ path: 'enrolledPatients.patient', select: 'name email phone age gender nic' });

    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE all schedule sessions
router.delete('/', async (req, res) => {
  try {
    const result = await Schedule.deleteMany({});
    res.json({ message: `Successfully cleared ${result.deletedCount} timetable sessions.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE single session
router.delete('/:id', async (req, res) => {
  try {
    const session = await Schedule.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE single session
router.put('/:id', async (req, res) => {
  try {
    const { doctor, room, dayOfWeek, startTime, endTime, timeBlock, date } = req.body;

    // VALIDATION: Room Busy Check (excluding current session)
    const existingRoomUsage = await Schedule.findOne({
      _id: { $ne: req.params.id },
      dayOfWeek,
      timeBlock,
      room
    });

    if (existingRoomUsage) {
      return res.status(400).json({ error: 'This room is already occupied during this time block.' });
    }

    // VALIDATION: Doctor Busy Check (excluding current session)
    const existingDoctorUsage = await Schedule.findOne({
      _id: { $ne: req.params.id },
      dayOfWeek,
      timeBlock,
      doctor
    });

    if (existingDoctorUsage) {
      return res.status(400).json({ error: 'This doctor is already scheduled for another session during this time block.' });
    }

    // NEW VALIDATION: Staff Busy Check
    const targetRoom = await Room.findById(room);
    if (!targetRoom) return res.status(404).json({ error: 'Room not found' });
    
    const staffIds = [...(targetRoom.nurses || []), ...(targetRoom.attendants || [])];
    for (const sId of staffIds) {
        const otherRoomsWithThisStaff = await Room.find({ _id: { $ne: targetRoom._id }, $or: [{ nurses: sId }, { attendants: sId }] });
        for (const oRoom of otherRoomsWithThisStaff) {
            const conflict = await Schedule.findOne({ 
                _id: { $ne: req.params.id },
                room: oRoom._id, 
                dayOfWeek, 
                timeBlock 
            });
            if (conflict) {
                const staffMember = await User.findById(sId);
                return res.status(400).json({ error: `Staff Conflict: ${staffMember.name} is already assigned to ${oRoom.name} during this session.` });
            }
        }
    }

    const updatedSession = await Schedule.findByIdAndUpdate(
      req.params.id,
      { doctor, room, dayOfWeek, startTime, endTime, timeBlock, date },
      { new: true }
    );

    if (!updatedSession) return res.status(404).json({ error: 'Session not found' });
    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET schedules for a specific patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const list = await Schedule.find({ 'enrolledPatients.patient': req.params.patientId })
      .populate({
        path: 'doctor',
        populate: { path: 'user' }
      })
      .populate('room');
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ENROLL a patient in a session (with optional report)
router.post('/:id/enroll', upload.single('medicalReport'), async (req, res) => {
  try {
    const { patientId, illnessDescription } = req.body;
    const session = await Schedule.findById(req.params.id);

    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Check if already enrolled
    const isEnrolled = session.enrolledPatients.some(ep => ep.patient && ep.patient.toString() === patientId);
    if (isEnrolled) {
      return res.status(400).json({ error: 'You are already enrolled in this session.' });
    }

    const enrollment = {
      patient: patientId,
      medicalReport: req.file ? req.file.path : null,
      illnessDescription: illnessDescription || ''
    };

    session.enrolledPatients.push(enrollment);
    await session.save();

    // Mirror to MedicalRecord table
    const MedicalRecord = require('../models/MedicalRecord');
    
    // Create record for the illness description/visit details
    await MedicalRecord.create({
      patient: patientId,
      doctor: session.doctor,
      session: session._id,
      recordType: 'PAST_REPORT', // Or a new type VISIT_DETAIL if needed
      title: `Visit Note: ${session.date}`,
      description: illnessDescription || 'No description provided.',
      date: new Date()
    });

    // Mirror the uploaded report if it exists
    if (req.file) {
      await MedicalRecord.create({
        patient: patientId,
        doctor: session.doctor,
        session: session._id,
        recordType: 'PAST_REPORT',
        title: `Uploaded Report: ${req.file.originalname}`,
        description: `Related to visit on ${session.date}`,
        filePath: req.file.path,
        date: new Date()
      });
    }

    res.json({ message: 'Successfully enrolled in session', session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UNENROLL a patient from a session
router.post('/:id/unenroll', async (req, res) => {
  try {
    const { patientId } = req.body;
    const session = await Schedule.findById(req.params.id);

    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.enrolledPatients = session.enrolledPatients.filter(ep => ep.patient && ep.patient.toString() !== patientId);
    await session.save();

    res.json({ message: 'Successfully cancelled appointment', session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE patient session status (for doctors)
router.patch('/:sessionId/patient/:patientId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const session = await Schedule.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const patientEntry = session.enrolledPatients.find(ep => 
      ep.patient && ep.patient.toString() === req.params.patientId
    );
    if (!patientEntry) return res.status(404).json({ error: 'Patient enrollment not found' });

    patientEntry.status = status;
    await session.save();

    res.json({ message: `Status updated to ${status}`, session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
