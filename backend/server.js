const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const availabilityRoutes = require('./routes/doctor-availabilities');
const roomRoutes = require('./routes/rooms');
const scheduleRoutes = require('./routes/schedule');
const meetingRoutes = require('./routes/meetings');
const prescriptionRoutes = require('./routes/prescription');
const statsRoutes = require('./routes/stats');
const medicalRecordRoutes = require('./routes/medical-records');
const queueRoutes = require('./routes/queue');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clinic_db';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/uploads', express.static('uploads'));

// Routes
// Using /api prefix to match typical Spring Boot convention
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/doctor-availabilities', availabilityRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/queue', queueRoutes);

// Fallback test route
app.get('/api/test', (req, res) => res.send('API is running'));

// DB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log(`- Backend successfully connected to: ${MONGODB_URI}`);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
});