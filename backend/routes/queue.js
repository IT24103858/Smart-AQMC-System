const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const RegisteredPatient = require('../models/RegisteredPatient');
const Counter = require('../models/Counter');
const Schedule = require('../models/Schedule');
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
    const { nic, severity } = req.body;

    // 1. Find Registered Patient
    const regPatient = await RegisteredPatient.findOne({ nic });
    if (!regPatient) {
      return res.status(404).json({ message: 'Patient not found. Please register first.' });
    }

    // 2. Check if already in queue
    const existingEntry = await Patient.findOne({ 
      registeredPatientId: regPatient._id, 
      status: { $in: ['waiting', 'called', 'delayed'] } 
    });
    if (existingEntry) {
      return res.status(400).json({ message: 'Patient is already in the queue.' });
    }

    // 3. Generate Token and Save
    const tokenId = await getNextTokenId();
    const newPatient = new Patient({
      tokenId,
      registeredPatientId: regPatient._id,
      severity: severity || 'Normal'
    });

    await newPatient.save();
    res.status(201).json(newPatient);
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
    const patients = await Patient.find({ 
      status: { $in: ['waiting', 'skipped', 'delayed'] } 
    }).populate('registeredPatientId', 'name nic');

    const sortedQueue = sortQueue(patients);
    
    // Find currently called patient
    const currentlyCalled = await Patient.findOne({ status: 'called' })
      .populate('registeredPatientId', 'name nic')
      .sort({ updatedAt: -1 });

    // Fetch Booked Patients from Schedule for Today
    const today = new Date().toISOString().split('T')[0];
    const todaysSchedules = await Schedule.find({ date: today }).populate('enrolledPatients.patient', 'name nic');
    
    let bookedPatients = [];
    todaysSchedules.forEach(session => {
      session.enrolledPatients.forEach(entry => {
        bookedPatients.push({
          id: entry._id,
          name: entry.patient?.name || 'Unknown',
          nic: entry.patient?.nic || 'N/A',
          timeBlock: session.timeBlock,
          status: 'Booked'
        });
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
    const { status } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/queue/patients-list
 * @desc    Get all registered patients for selection
 */
router.get('/patients-list', async (req, res) => {
  try {
    const patients = await RegisteredPatient.find({}, 'name nic');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
