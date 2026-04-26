const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');

// POST a new prescription
router.post('/', async (req, res) => {
  try {
    const { doctor, patient, session, diagnosis, medications, instructions, followUp } = req.body;
    
    // Basic validation
    if(!doctor || !patient || !session || !diagnosis || !medications) {
        return res.status(400).json({ error: 'Missing required prescription fields' });
    }

    const newPrescription = await Prescription.create({
      doctor,
      patient,
      session,
      diagnosis,
      medications,
      instructions,
      followUp
    });

    // Mirror to MedicalRecord table
    const MedicalRecord = require('../models/MedicalRecord');
    await MedicalRecord.create({
      patient,
      doctor,
      session,
      recordType: 'PRESCRIPTION',
      title: `Prescription for ${diagnosis}`,
      description: medications,
      prescription: newPrescription._id,
      date: newPrescription.date
    });

    res.status(201).json(newPrescription);
  } catch (error) {
    console.error('Prescription create failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET all prescriptions for a doctor
router.get('/doctor/:id', async (req, res) => {
  try {
    const list = await Prescription.find({ doctor: req.params.id })
        .populate('patient')
        .populate('session');
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all prescriptions for a specific session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const list = await Prescription.find({ session: req.params.sessionId });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET prescriptions for a specific patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const list = await Prescription.find({ patient: req.params.patientId })
        .populate({
            path: 'doctor',
            populate: { path: 'user' }
        })
        .populate('session');
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
