const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  notes: String
});

const workoutPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['service', 'class'], required: true },
  related: { type: String, required: true },
  description: String,
  exercises: [exerciseSchema]
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
