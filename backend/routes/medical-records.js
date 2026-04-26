const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/reports';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// GET all medical records for a specific patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const list = await MedicalRecord.find({ patient: req.params.patientId })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .populate('session')
      .populate('prescription')
      .sort({ date: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET records for a doctor (to see their history with patients)
router.get('/doctor/:doctorId', async (req, res) => {
    try {
      const list = await MedicalRecord.find({ doctor: req.params.doctorId })
        .populate('patient', 'name nic email')
        .sort({ date: -1 });
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// POST new medical record (with optional file upload)
router.post('/', upload.single('file'), async (req, res) => {
    try {
      const { patient, title, description, recordType, doctor, session } = req.body;
      
      const newRecord = new MedicalRecord({
        patient,
        title,
        description,
        recordType: recordType || 'PAST_REPORT',
        doctor: doctor || undefined,
        session: session || undefined,
        filePath: req.file ? req.file.path : undefined,
        date: new Date()
      });
  
      await newRecord.save();
      res.status(201).json(newRecord);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

module.exports = router;
