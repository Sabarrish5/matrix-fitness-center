const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const WorkoutPlan = require('./models/WorkoutPlan');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/matrix_fitness', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('MongoDB connected!');
});

// --- USER ROUTES ---

// Registration (with optional plan assignment)
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone, membership, classType, classTime, service, role } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already registered" });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let plan = null;
    if (service) {
      plan = await WorkoutPlan.findOne({ related: service, type: 'service' });
    } else if (classType) {
      plan = await WorkoutPlan.findOne({ related: classType, type: 'class' });
    }
    const user = new User({
      name, email, password: hashedPassword, phone, membership, classType, classTime, service, role: role || 'user',
      workoutPlan: plan ? plan._id : null
    });
    await user.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });
  res.json({
    name: user.name,
    email: user.email,
    phone: user.phone,
    membership: user.membership,
    classType: user.classType,
    classTime: user.classTime,
    service: user.service,
    role: user.role,
    workoutPlan: user.workoutPlan
  });
});

// Get all users (Admin) - populates workoutPlan
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .populate('workoutPlan');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user info for dashboard
app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email })
      .populate('workoutPlan')
      .select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new user (Admin)
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, phone, membership, classType, classTime, service, role } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name, email, password: hashedPassword, phone, membership, classType, classTime, service, role: role || 'user'
    });
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user (Admin)
app.put('/api/users/:email', async (req, res) => {
  try {
    const { name, password, phone, membership, classType, classTime, service, role } = req.body;
    const update = { name, phone, membership, classType, classTime, service, role };
    if (password) update.password = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { $set: update },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated!", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user (Admin)
app.delete('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign workout plan to user
app.put('/api/users/:email/assign-workout', async (req, res) => {
  try {
    const { workoutPlanId } = req.body;
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { $set: { workoutPlan: workoutPlanId } },
      { new: true }
    ).populate('workoutPlan');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Workout plan assigned!", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- WORKOUT PLAN ROUTES ---

// Get all workout plans
app.get('/api/workoutplans', async (req, res) => {
  try {
    const plans = await WorkoutPlan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get workout plans by type (e.g., /api/workouts?type=class)
app.get('/api/workouts', async (req, res) => {
  try {
    const { type } = req.query;
    const plans = type ? await WorkoutPlan.find({ type }) : await WorkoutPlan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching workouts' });
  }
});

// Add workout plan
app.post('/api/workoutplans', async (req, res) => {
  try {
    const { name, description, type, related, exercises } = req.body;
    const plan = new WorkoutPlan({ name, description, type, related, exercises });
    await plan.save();
    res.status(201).json({ message: "Workout plan created!", plan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update workout plan (including exercises)
app.put('/api/workoutplans/:id', async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json({ message: "Plan updated!", plan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete workout plan
app.delete('/api/workoutplans/:id', async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json({ message: "Plan deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
