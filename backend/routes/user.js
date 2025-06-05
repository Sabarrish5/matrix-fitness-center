const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user by email and populate workout plan
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).populate('workoutPlan');
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      service: user.service,
      classType: user.classType,
      workoutPlan: user.workoutPlan // full plan details here
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user." });
  }
});

module.exports = router;
