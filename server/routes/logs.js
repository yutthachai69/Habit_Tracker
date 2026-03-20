const express = require('express')
const router = express.Router()
const HabitLog = require('../models/HabitLog')
const Habit = require('../models/Habit')

// GET /api/logs?date=YYYY-MM-DD — get all habit logs for a specific date
router.get('/', async (req, res) => {
  try {
    const { date } = req.query
    if (!date) return res.status(400).json({ error: 'date query param required' })

    const allHabits = await Habit.find().sort({ createdAt: 1 })
    
    // Filter habits due this specific date
    const dayOfWeek = new Date(date).getUTCDay()
    const habits = allHabits.filter((h) => {
      if (h.frequency === 'everyday') return true
      if (h.frequency === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5
      if (!h.frequency) return true // fallback
      return h.frequency.split(',').includes(dayOfWeek.toString())
    })

    const logs = await HabitLog.find({ date })

    // Build map of habitId -> completed
    const logMap = {}
    logs.forEach((l) => {
      logMap[l.habitId.toString()] = l.completed
    })

    // Merge habits with their completion status for the day
    const result = habits.map((h) => ({
      _id: h._id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      frequency: h.frequency,
      goal: h.goal,
      reminderTime: h.reminderTime,
      isSynced: h.isSynced,
      syncType: h.syncType,
      completed: logMap[h._id.toString()] || false,
    }))

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/logs/toggle — toggle completed for a habit on a date
router.post('/toggle', async (req, res) => {
  try {
    const { habitId, date } = req.body
    if (!habitId || !date) {
      return res.status(400).json({ error: 'habitId and date required' })
    }

    // Find or create, then toggle
    let log = await HabitLog.findOne({ habitId, date })
    if (!log) {
      log = new HabitLog({ habitId, date, completed: true })
    } else {
      log.completed = !log.completed
    }
    await log.save()
    res.json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/logs/stats?month=YYYY-MM — stats for calendar & insights
router.get('/stats', async (req, res) => {
  try {
    const { month } = req.query
    if (!month) return res.status(400).json({ error: 'month query param required (YYYY-MM)' })

    const habits = await Habit.find()

    // Helper to calc total due for a given date
    const getTotalDue = (dateStr) => {
      const dayOfWeek = new Date(dateStr).getUTCDay()
      let count = 0
      habits.forEach((h) => {
        if (h.frequency === 'everyday') count++
        else if (h.frequency === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) count++
        else if (h.frequency && h.frequency.split(',').includes(dayOfWeek.toString())) count++
      })
      return count
    }

    // Fetch all logs for the given month
    const logs = await HabitLog.find({ date: { $regex: `^${month}` }, completed: true })

    // Group completed logs by date
    const byDate = {}
    logs.forEach((l) => {
      if (!byDate[l.date]) byDate[l.date] = 0
      byDate[l.date]++
    })

    // Build daily summary: { date, completed, total, fullyDone }
    const dailySummary = Object.entries(byDate).map(([date, completed]) => {
      const total = getTotalDue(date)
      return {
        date,
        completed,
        total,
        fullyDone: completed >= total && total > 0,
      }
    })

    // Weekly completion % (last 7 days)
    const today = new Date()
    const weekly = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 3)
      const completedCount = byDate[dateStr] || 0
      const totalDueThisDay = getTotalDue(dateStr)
      const pct = totalDueThisDay > 0 ? Math.round((completedCount / totalDueThisDay) * 100) : 0
      weekly.push({ day: dayName, date: dateStr, pct, isToday: i === 0 })
    }

    // Current streak (count consecutive days from today going back)
    let streak = 0
    const checkDate = new Date(today)
    while (true) {
      const ds = checkDate.toISOString().split('T')[0]
      const count = byDate[ds] || 0
      const expected = getTotalDue(ds)
      
      // If there's nothing due on this day, should it break the streak?
      // Usually "rest days" (0 expected) don't break the streak, we just skip over it
      if (expected === 0) {
        checkDate.setDate(checkDate.getDate() - 1)
        continue
      }
      
      if (count >= expected) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Habit performance (completion % per habit this month)
    const allMonthLogs = await HabitLog.find({ date: { $regex: `^${month}` } })
    const habitStats = {}
    allMonthLogs.forEach((l) => {
      const id = l.habitId.toString()
      if (!habitStats[id]) habitStats[id] = { total: 0, completed: 0 }
      habitStats[id].total++
      if (l.completed) habitStats[id].completed++
    })

    const habitPerformance = habits.map((h) => {
      const stat = habitStats[h._id.toString()] || { total: 0, completed: 0 }
      const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0
      return { _id: h._id, name: h.name, icon: h.icon, pct }
    })

    res.json({ dailySummary, weekly, streak, habitPerformance, totalHabits: habits.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/logs/xp — calculate total XP and current level
router.get('/xp', async (req, res) => {
  try {
    const completedLogsCount = await HabitLog.countDocuments({ completed: true })
    const totalXP = completedLogsCount * 100
    
    // Level formula: 1000 XP per level
    const level = Math.floor(totalXP / 1000) + 1
    const currentLevelXP = totalXP % 1000
    const progressPct = (currentLevelXP / 1000) * 100
    
    res.json({
      totalXP,
      level,
      currentLevelXP,
      xpToNextLevel: 1000 - currentLevelXP,
      progressPct
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
