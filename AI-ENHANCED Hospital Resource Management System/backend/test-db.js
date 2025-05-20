// test-db.js
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital-resource-management')
  .then(() => {
    console.log('MongoDB Connected Successfully!');
    console.log('Connection URI:', mongoose.connection.client.s.url);
    console.log('Database Name:', mongoose.connection.db.databaseName);
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });