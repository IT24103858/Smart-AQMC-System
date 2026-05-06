const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const DoctorAvailability = require('../models/DoctorAvailability');

router.get('/', async (req, res) => {
  try { res.json(await Doctor.find().populate('user')); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.userId }).populate('user');
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try { res.json(await Doctor.findById(req.params.id).populate('user')); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { user: userData, ...doctorData } = req.body;

    // 1. Create User
    const user = new User(userData);
    await user.save();

    // 2. Create Doctor with user id
    const doctor = new Doctor({
      ...doctorData,
      user: user._id
    });

    await doctor.save();

    // Populate before sending back
    const populatedDoctor = await Doctor.findById(doctor._id).populate('user');
    res.status(201).json(populatedDoctor);
  } catch (error) {
    console.error('Save doctor error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { user: userData, ...doctorData } = req.body;

    // Find doctor to get associated user id
    const existingDoctor = await Doctor.findById(req.params.id);
    if (!existingDoctor) return res.status(404).json({ error: 'Doctor not found' });

    // 1. Update User
    if (userData) {
      // If password is blank (sent from frontend), don't update it
      if (!userData.password) {
        delete userData.password;
      }
      await User.findByIdAndUpdate(existingDoctor.user, userData, { new: true });
    }

    // 2. Update Doctor
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      doctorData,
      { new: true }
    ).populate('user');

    res.json(updatedDoctor);
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    // 1. Delete associated User
    await User.findByIdAndDelete(doctor.user);

    // 2. Delete associated Availabilities
    await DoctorAvailability.deleteMany({ doctor: req.params.id });

    // 3. Delete Doctor
    await Doctor.findByIdAndDelete(req.params.id);

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Availabilities helper inside doctor routes
router.get('/:id/availabilities', async (req, res) => {
  try { res.json(await DoctorAvailability.find({ doctor: req.params.id })); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/availabilities', async (req, res) => {
  try {
    const availability = new DoctorAvailability({ ...req.body, doctor: req.params.id });
    await availability.save();
    res.status(201).json(availability);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.get('/specialization/:spec', async (req, res) => {
  try {
    const spec = req.params.spec;
    const doctors = await Doctor.find({
      specialization: { $regex: new RegExp('^' + spec + '$', 'i') }
    }).populate('user');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
