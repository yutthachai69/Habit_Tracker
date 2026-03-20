const express = require('express')
const router = express.Router()
const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')

const TOKEN_PATH = path.join(__dirname, '../google-token.json')

const getFitnessClient = () => {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error('Not connected to Google Fit')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH))
  oauth2Client.setCredentials(tokens)

  return google.fitness({ version: 'v1', auth: oauth2Client })
}

// GET /api/fit/sync?date=YYYY-MM-DD
router.get('/sync', async (req, res) => {
  const { date } = req.query
  if (!date) return res.status(400).json({ error: 'Date is required' })

  try {
    const fitness = getFitnessClient()

    // ให้ดึงข้อมูลตั้งแต่ 00:00:00 ถึง 23:59:59 ของวันที่ระบุ
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const response = await fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [
          { dataTypeName: 'com.google.step_count.delta' },
          { dataTypeName: 'com.google.distance.delta' }
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startOfDay.getTime(),
        endTimeMillis: endOfDay.getTime()
      }
    })

    const buckets = response.data.bucket
    let steps = 0
    let distance = 0 // เป็นเมตร

    if (buckets && buckets.length > 0) {
      // Steps
      const stepDataset = buckets[0].dataset.find(d => d.dataSourceId.includes('step_count'))
      if (stepDataset && stepDataset.point && stepDataset.point.length > 0) {
        steps = stepDataset.point.reduce((acc, p) => acc + (p.value[0].intVal || 0), 0)
      }

      // Distance
      const distDataset = buckets[0].dataset.find(d => d.dataSourceId.includes('distance'))
      if (distDataset && distDataset.point && distDataset.point.length > 0) {
        distance = distDataset.point.reduce((acc, p) => acc + (p.value[0].fpVal || 0), 0)
      }
    }

    res.json({ steps, distance: Math.round(distance) })
  } catch (error) {
    console.error('Error fetching Google Fit data:', error.message)
    const status = error.message === 'Not connected to Google Fit' ? 401 : 500
    res.status(status).json({ error: error.message || 'Failed to sync with Google Fit' })
  }
})

module.exports = router
