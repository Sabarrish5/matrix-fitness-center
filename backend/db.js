const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/matrix_fitness', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('connected', () => {
  console.log('MongoDB connected!');
});
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = db;
