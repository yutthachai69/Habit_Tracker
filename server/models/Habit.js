const mongoose = require('mongoose')

const HabitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: 'check_circle',
  },
  color: {
    type: String,
    default: 'primary', // maps to Tailwind color token
  },
  frequency: {
    type: String, // 'everyday', 'weekdays', or specific days like '0,1,2,3,4,5,6' (0 = Sunday)
    default: 'everyday',
  },
  goal: {
    type: Number,
    default: 1,
    min: 1,
  },
  reminderTime: {
    type: String,
    default: '08:00',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isSynced: {
    type: Boolean,
    default: false,
  },
  syncType: {
    type: String,
    enum: ['steps', 'distance'], // or ''
    default: 'steps',
  }
})

module.exports = mongoose.model('Habit', HabitSchema)
