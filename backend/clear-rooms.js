const mongoose = require('mongoose');
const Room = require('./models/Room');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project2';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');

  // Clear existing rooms
  const result = await Room.deleteMany({});
  console.log(`Successfully deleted ${result.deletedCount} rooms.`);

  console.log('Room clearing complete!');
  mongoose.connection.close();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
