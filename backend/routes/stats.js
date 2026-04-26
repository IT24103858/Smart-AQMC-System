const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Room = require('../models/Room');
const Schedule = require('../models/Schedule');

const Prescription = require('../models/Prescription');

// GET /api/stats — live dashboard stats
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    // Offset for local time if needed, but let's assume server time is consistent with app time
    const todayStr = now.toISOString().split('T')[0];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[now.getDay()];
    
    // Current time in HH:mm format
    const currentHH = String(now.getHours()).padStart(2, '0');
    const currentMM = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHH}:${currentMM}`;

    const [doctorsCount, roomsCount, schedulesCount, staffCount, patientsCount] = await Promise.all([
      Doctor.countDocuments(),
      Room.countDocuments(),
      Schedule.countDocuments(),
      User.countDocuments({ role: { $in: ['NURSE', 'ATTENDANT'] } }),
      User.countDocuments({ role: 'PATIENT' }),
    ]);

    // Find currently active sessions
    const activeSessions = await Schedule.find({
      $or: [
        { date: todayStr },
        { dayOfWeek: currentDayName }
      ],
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime }
    });

    // Unique active rooms and doctors
    const activeRoomIds = [...new Set(activeSessions.map(s => s.room.toString()))];
    const activeDoctorIds = [...new Set(activeSessions.map(s => s.doctor.toString()))];

    const conflictsAgg = await Schedule.aggregate([
      {
        $group: {
          _id: { room: '$room', dayOfWeek: '$dayOfWeek', timeBlock: '$timeBlock' },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    res.json({
      doctors: doctorsCount,
      rooms: roomsCount,
      sessions: schedulesCount,
      staff: staffCount,
      patients: patientsCount,
      conflicts: conflictsAgg.length,
      activeRooms: activeRoomIds.length,
      activeDoctors: activeDoctorIds.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/doctor/:doctorId — live doctor dashboard stats
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[now.getDay()];

    // 1. Get today's sessions
    const todaySessions = await Schedule.find({
      doctor: doctorId,
      $or: [
        { date: todayStr },
        { dayOfWeek: currentDayName } // Fallback/Support for recurring if date isn't exact
      ]
    }).populate('room');

    // 2. Count today's patients
    const totalTodayPatients = todaySessions.reduce((acc, s) => acc + (s.enrolledPatients?.length || 0), 0);

    // 3. Count today's prescriptions
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayPrescriptionCount = await Prescription.countDocuments({
      doctor: doctorId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // 4. Get doctor profile for fee
    const doctorProfile = await Doctor.findById(doctorId);

    res.json({
      todaySessionsCount: todaySessions.length,
      totalTodayPatients,
      todayPrescriptionCount,
      consultantFee: doctorProfile?.consultantFee || 0,
      todaySessions: todaySessions, // returning for the list as well
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
