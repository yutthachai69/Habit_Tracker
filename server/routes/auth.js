const express = require('express')
const router = express.Router()
const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')

// สำหรับแอประบบ 1 คนใช้ (Single User) การเก็บ Token ไว้ในไฟล์ชั่วคราวเป็นวิธีที่ง่ายและเร็วที่สุด
// ในระบบที่มีหลายยูสเซอร์ ควรเก็บใส่ MongoDB ผูกกับ User ID
const TOKEN_PATH = path.join(__dirname, '../google-token.json')

const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

// เช็คสถานะการเชื่อมต่อ
router.get('/status', (req, res) => {
  const isConnected = fs.existsSync(TOKEN_PATH)
  res.json({ connected: isConnected })
})

// 1. เริ่มต้นการขอ Login (Redirect ไปหน้ากูเกิล)
router.get('/google', (req, res) => {
  const oauth2Client = getOAuth2Client()
  const scopes = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.location.read'
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // เพื่อขอ Refresh Token ติดมาด้วย
    prompt: 'consent',
    scope: scopes
  })

  res.redirect(url)
})

// 2. รับรหัสกลับมาจากเว็ป Google แล้วเปลี่ยนเป็น Token
router.get('/google/callback', async (req, res) => {
  const { code } = req.query
  if (!code) {
    return res.status(400).send('No code provided by Google')
  }

  try {
    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)
    
    // เซฟ token ลงไฟล์
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
    
    // ส่งกลับไปหน้าตั้งค่าของแอป React
    res.redirect('http://localhost:5173/settings')
  } catch (error) {
    console.error('Error retrieving access token', error)
    res.status(500).send('Authentication failed')
  }
})

// ลบการเชื่อมต่อ (ยกเลิกผูก)
router.post('/disconnect', (req, res) => {
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH)
  }
  res.json({ success: true })
})

module.exports = router
