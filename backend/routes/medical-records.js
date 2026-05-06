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

// GET all medical records (Admin view)
router.get('/', async (req, res) => {
    try {
      const list = await MedicalRecord.find({
        recordType: { $in: ['PAST_REPORT', 'PRESCRIPTION'] }
      })
        .populate('patient', 'name nic email')
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

// DELETE medical record
router.delete('/:id', async (req, res) => {
    try {
      const record = await MedicalRecord.findByIdAndDelete(req.params.id);
      if (!record) return res.status(404).json({ error: 'Record not found' });
      
      // Also delete the file if it exists
      if (record.filePath && fs.existsSync(record.filePath)) {
          fs.unlinkSync(record.filePath);
      }
      
      res.json({ message: 'Record deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
