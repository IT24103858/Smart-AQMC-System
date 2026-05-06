const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to DB');
    try {
      await mongoose.connection.collection('patients').dropIndex('token_1');
      console.log('Successfully dropped token_1 index from patients collection');
    } catch (err) {
      console.error('Error dropping index (it may not exist):', err.message);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
