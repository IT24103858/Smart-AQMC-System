const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');

// Register
router.post('/register', async (req, res) => {
  try {
    // Explicitly set role to PATIENT for public registration
    const userData = { 
      ...req.body, 
      role: 'PATIENT', // Always force PATIENT role on public registration
      status: 'active' 
    };
    
    const user = new User(userData);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    // For newly hashed passwords
    let isMatch = false;
    if (user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Fallback for older plaintext passwords in the DB
      isMatch = (password === user.password);
    }
    
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    const userJson = user.toJSON();
    
    // If it's a doctor, add doctorId to response
    if (user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) {
        userJson.doctorId = doctor._id;
      }
    }
    
    res.json(userJson);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
