const express = require('express')
const router = express.Router()
const Habit = require('../models/Habit')
const HabitLog = require('../models/HabitLog')

// GET /api/habits — get all habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: 1 })
    res.json(habits)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/habits — create new habit
router.post('/', async (req, res) => {
  try {
    const habit = new Habit(req.body)
    const saved = await habit.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /api/habits/:id — update habit
router.put('/:id', async (req, res) => {
  try {
    const updated = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!updated) return res.status(404).json({ error: 'Habit not found' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/habits/:id — delete habit and its logs
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id)
    if (!habit) return res.status(404).json({ error: 'Habit not found' })
    // Clean up all logs for this habit
    await HabitLog.deleteMany({ habitId: req.params.id })
    res.json({ message: 'Habit deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
