require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./db')

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/habits', require('./routes/habits'))
app.use('/api/logs', require('./routes/logs'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/fit', require('./routes/fit'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})
