const express = require('express');
const router = express.Router();
const DoctorAvailability = require('../models/DoctorAvailability');

router.get('/', async (req, res) => {
  try {
    const { doctorId } = req.query;
    if (doctorId) {
       return res.json(await DoctorAvailability.find({ doctor: doctorId }));
    }
    res.json(await DoctorAvailability.find());
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try { res.json(await DoctorAvailability.findById(req.params.id)); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const availability = new DoctorAvailability(req.body);
    await availability.save();
    res.status(201).json(availability);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const availability = await DoctorAvailability.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(availability);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await DoctorAvailability.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
