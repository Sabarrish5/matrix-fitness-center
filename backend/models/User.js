const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const workoutSchema = new mongoose.Schema({
  name: String,
  notes: String,
  date: String
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  membership: String,
  classType: String,
  classTime: String,
  service: String,
 role: { type: String, default: 'user', enum: ['user', 'admin'] },
  workoutPlan: { type: Schema.Types.ObjectId, ref: 'WorkoutPlan' },
  workouts: [workoutSchema]
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
