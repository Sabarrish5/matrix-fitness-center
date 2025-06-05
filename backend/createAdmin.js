const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Adjust path if needed

mongoose.connect('mongodb://127.0. 0.1:27017/test');

async function createAdmin() {
  const exists = await User.findOne({ email: 'admin@matrix.com' });
  if (!exists) {
    const hash = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@matrix.com',
      password: hash,
      phone: '0000000000',
      role: 'admin'
    });
    console.log('Admin user created!');
  } else {
    console.log('Admin already exists.');
  }
  mongoose.disconnect();
}

createAdmin();
