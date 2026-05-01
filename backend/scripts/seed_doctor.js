const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

dotenv.config();

async function seedDoctor() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const email = 'doctor_test@sehatsetu.com';
    const password = 'doctorPassword123';

    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log('Creating User account...');
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        email,
        password: hashedPassword,
        role: 'DOCTOR'
      });
      console.log('User created:', user._id);
    } else {
      console.log('User already exists, updating role...');
      user.role = 'DOCTOR';
      await user.save();
    }

    // 2. Create Doctor Profile
    let doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      console.log('Creating Doctor profile...');
      doctor = await Doctor.create({
        userId: user._id,
        fullName: 'Dr. John Smith',
        department: 'General Medicine',
        status: 'offline'
      });
      console.log('Doctor profile created:', doctor._id);
    } else {
      console.log('Doctor profile already exists.');
    }

    console.log('\n--- Doctor Account Ready ---');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('----------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctor:', error);
    process.exit(1);
  }
}

seedDoctor();
