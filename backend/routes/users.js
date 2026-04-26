const express = require('express');
const router = express.Router();
const User = require('../models/User');

const Doctor = require('../models/Doctor');
const DoctorAvailability = require('../models/DoctorAvailability');

router.get('/', async (req, res) => {
  try { res.json(await User.find()); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const user = new User({ ...req.body, status: 'active' });
    await user.save();
    res.status(201).json(user);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    if (!req.body.password) {
      delete req.body.password;
    } else {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // If it's a doctor, delete doctor and availabilities
    if (user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) {
        // Delete all availabilities for this doctor
        await DoctorAvailability.deleteMany({ doctor: doctor._id });
        // Delete the doctor record
        await Doctor.findByIdAndDelete(doctor._id);
      }
    }

    // Finally, delete the User
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
