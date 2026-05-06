const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const RegisteredPatient = require('../models/RegisteredPatient');
const Counter = require('../models/Counter');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const { sortQueue } = require('../utils/queue');

// Helper to generate next Token ID
async function getNextTokenId() {
  const counter = await Counter.findOneAndUpdate(
    { id: 'patientToken' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `TOK-${counter.seq.toString().padStart(3, '0')}`;
}

/**
 * @route   POST /api/queue/check-in
 * @desc    Check in a registered patient into the queue
 */
router.post('/check-in', async (req, res) => {
  try {
    const { nic, severity, unit } = req.body;

    // 1. Find Patient (Prefer User model, fallback to RegisteredPatient and migrate)
    let regPatient = await User.findOne({ nic, role: 'patient' });
    
    if (!regPatient) {
      const oldReg = await RegisteredPatient.findOne({ nic });
      if (oldReg) {
        // Migrate to User collection on the fly
        regPatient = new User({
          name: oldReg.name,
          nic: oldReg.nic,
          email: oldReg.email || `${oldReg.nic}@walkin.local`,
          phone: oldReg.phone || '0000000000',
          password: oldReg.password || 'password123',
          role: 'patient'
        });
        await regPatient.save();
      }
    }
    
    if (!regPatient) {
      return res.status(404).json({ message: 'Patient not found. Please register first.' });
    }

    // 2. Check if already in queue
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const existingEntry = await Patient.findOne({ 
      registeredPatientId: regPatient._id, 
      status: { $in: ['waiting', 'called', 'delayed'] },
      checkInTime: { $gte: startOfToday }
    });
    if (existingEntry) {
      return res.status(400).json({ message: 'Patient is already in the queue.' });
    }

    // Calculate score based on unit
    let score = 0;
    if (unit === 'OPD-Urgent') score = 30;
    else if (unit === 'Booked') score = 20;
    else if (unit === 'OPD-Normal') score = 10;
    else if (unit === 'Critical') score = 0; // FCFS

    // 3. Generate Token and Save
    const tokenId = await getNextTokenId();
    const newPatient = new Patient({
      tokenId,
      registeredPatientId: regPatient._id,
      severity: severity || 'Normal',
      unit: unit || 'Normal',
      score
    });

    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/queue/quick-register
 * @desc    Quickly register a new patient and check them in
 */
router.post('/quick-register', async (req, res) => {
  try {
    const { name, nic, email, phone, bloodGroup, password, severity, unit } = req.body;

    if (!name || !nic) {
      return res.status(400).json({ message: 'Name and NIC are required.' });
    }

    // 1. Find or create User (as Patient)
    let regPatient = await User.findOne({ nic });
    
    // Check legacy records too
    if (!regPatient) {
      const legacyPatient = await RegisteredPatient.findOne({ nic });
      if (legacyPatient) {
        // Migrate legacy to User
        regPatient = new User({
          name: legacyPatient.name,
          nic: legacyPatient.nic,
          email: legacyPatient.email || `${legacyPatient.nic}@walkin.local`,
          phone: legacyPatient.phone || '0000000000',
          password: password || 'password123',
          role: 'patient'
        });
        await regPatient.save();
      }
    }

    if (!regPatient) {
      if (!password) {
        return res.status(400).json({ message: 'Password is required for new registration.' });
      }
      
      if (email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({ message: 'Email is already registered to another patient.' });
        }
      }
      
      const generatedEmail = email || `${nic}@quickregister.local`;
      regPatient = new User({
        name,
        nic,
        email: generatedEmail,
        phone: phone || '',
        bloodGroup: bloodGroup || '',
        password: password,
        role: 'patient'
      });
      await regPatient.save();
    }

    // 2. Check if already in queue today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const existingEntry = await Patient.findOne({ 
      registeredPatientId: regPatient._id, 
      status: { $in: ['waiting', 'called', 'delayed'] },
      checkInTime: { $gte: startOfToday }
    });
    if (existingEntry) {
      return res.status(400).json({ message: 'Patient is already in the queue.' });
    }

    // Calculate score based on unit
    let score = 0;
    if (unit === 'OPD-Urgent') score = 30;
    else if (unit === 'Booked') score = 20;
    else if (unit === 'OPD-Normal') score = 10;
    else if (unit === 'Critical') score = 0; // FCFS

    // 3. Generate Token and Save
    const tokenId = await getNextTokenId();
    const newPatient = new Patient({
      tokenId,
      registeredPatientId: regPatient._id,
      severity: severity || 'Normal',
      unit: unit || 'Normal',
      score
    });

    await newPatient.save();
    res.status(201).json({ token: newPatient, patient: regPatient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/queue/state
 * @desc    Get the current sorted state of the queue
 */
router.get('/state', async (req, res) => {
  try {
    // Only get patients checked in today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const patients = await Patient.find({ 
      status: { $in: ['waiting', 'skipped', 'delayed'] },
      checkInTime: { $gte: startOfToday }
    }).populate('registeredPatientId', 'name nic');

    const sortedQueue = sortQueue(patients);
    
    // Find currently called patient
    const currentlyCalled = await Patient.findOne({ status: 'called' })
      .populate('registeredPatientId', 'name nic')
      .sort({ updatedAt: -1 });

    // Fetch ALL Pending Booked Patients from Schedule
    const todaysSchedules = await Schedule.find({ 
      'enrolledPatients.status': 'PENDING' 
    })
      .populate('enrolledPatients.patient', 'name nic phone role')
      .populate('doctor', 'name specialization')
      .populate('room', 'name location');
    
    // Get all IDs of patients already in today's active queue
    const activePatientIds = patients.map(p => p.registeredPatientId?._id?.toString());
    const calledPatientId = currentlyCalled?.registeredPatientId?._id?.toString();

    let bookedPatients = [];
    todaysSchedules.forEach(session => {
      session.enrolledPatients.forEach(entry => {
        const patientId = entry.patient?._id?.toString();
        
        // Filter: Must be PENDING, must have role 'patient', and not already in active queue
        if (
          entry.status === 'PENDING' && 
          entry.patient?.role === 'patient' && 
          !activePatientIds.includes(patientId) && 
          calledPatientId !== patientId
        ) {
          bookedPatients.push({
            id: entry._id,
            patientObjectId: entry.patient?._id,
            name: entry.patient?.name || 'Unknown',
            nic: entry.patient?.nic || 'N/A',
            phone: entry.patient?.phone || 'N/A',
            doctorName: session.doctor?.name || 'Unknown Doctor',
            roomName: session.room?.name || 'Unknown Room',
            date: session.date,
            timeBlock: session.timeBlock,
            status: 'Booked'
          });
        }
      });
    });

    res.json({
      queue: sortedQueue,
      currentlyCalled: currentlyCalled || null,
      bookedPatients: bookedPatients,
      bookedCount: bookedPatients.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PATCH /api/queue/call-next
 * @desc    Call the highest priority patient
 */
router.patch('/call-next', async (req, res) => {
  try {
    // 1. Get current sorted queue
    const patients = await Patient.find({ status: 'waiting' });
    if (patients.length === 0) {
      return res.status(404).json({ message: 'No patients in waiting line.' });
    }

    const sortedQueue = sortQueue(patients);
    const nextPatient = sortedQueue[0];

    // 2. Set previous 'called' to 'removed' (or handle accordingly)
    await Patient.updateMany({ status: 'called' }, { status: 'removed' });

    // 3. Update next patient to 'called'
    const updatedPatient = await Patient.findByIdAndUpdate(
      nextPatient._id,
      { status: 'called', calledTime: new Date() },
      { new: true }
    );

    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PATCH /api/queue/update-status/:id
 * @desc    Update status of a specific queue entry (skipped, delayed, removed)
 */
router.patch('/update-status/:id', async (req, res) => {
  try {
    const { status, delayReason } = req.body;
    const updateData = { status };
    if (delayReason !== undefined) {
      updateData.delayReason = delayReason;
    }
    
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/queue/patients-list
 * @desc    Get all registered patients for selection (both walk-ins and portal users)
 */
router.get('/patients-list', async (req, res) => {
  try {
    const walkIns = await RegisteredPatient.find({}, 'name nic');
    const portalUsers = await User.find({ role: { $regex: /^patient$/i } }, 'name nic');
    
    // Merge and remove duplicates by NIC
    const allPatients = [...walkIns, ...portalUsers];
    const uniquePatients = Array.from(new Map(allPatients.map(p => [p.nic, p])).values());
    
    res.json(uniquePatients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
