const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WorkoutPlan = require('../models/WorkoutPlan');
const bcrypt = require('bcrypt');

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Find the correct workout plan
    let plan = null;
    if (req.body.service) {
      plan = await WorkoutPlan.findOne({ related: req.body.service, type: 'service' });
    } else if (req.body.classType) {
      plan = await WorkoutPlan.findOne({ related: req.body.classType, type: 'class' });
    }

    // Create new user
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
      service: req.body.service,
      classType: req.body.classType,
      workoutPlan: plan ? plan._id : null
    });

    await user.save();
    res.status(201).json({ message: "Registration successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed." });
  }
});

module.exports = router;
