const mongoose = require('mongoose')

const HabitLogSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  date: {
    type: String, // format: YYYY-MM-DD
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
})

// ensure one log per habit per day
HabitLogSchema.index({ habitId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('HabitLog', HabitLogSchema)
