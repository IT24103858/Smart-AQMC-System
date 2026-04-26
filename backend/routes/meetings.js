const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');

// GET all meetings
router.get('/', async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ date: 1, startTime: 1 });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new meeting
router.post('/', async (req, res) => {
  try {
    const meeting = new Meeting(req.body);
    await meeting.save();
    res.status(201).json(meeting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE meeting
router.delete('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
