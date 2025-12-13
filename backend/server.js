import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { generateCsrfToken, validateCsrfToken } from './csrf.js'

const app = express()
const PORT = 3001

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// In-memory session store (NOT for production!)
const sessions = new Map()

// Helper to get or create session
function getSession(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    sessions.set(newSessionId, {
      username: null,
      csrfToken: generateCsrfToken(),
      createdAt: Date.now(),
    })
    return { sessionId: newSessionId, session: sessions.get(newSessionId) }
  }
  return { sessionId, session: sessions.get(sessionId) }
}

// Routes

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username } = req.body
  const sessionId = req.cookies.sessionId
  
  const { sessionId: newSessionId, session } = getSession(sessionId)
  session.username = username

  res.cookie('sessionId', newSessionId, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax',
    maxAge: 3600000, // 1 hour
  })

  res.json({
    success: true,
    message: 'Logged in successfully',
    username,
    csrfToken: session.csrfToken,
  })
})

// Get CSRF token
app.get('/api/csrf-token', (req, res) => {
  const sessionId = req.cookies.sessionId
  const { session } = getSession(sessionId)

  res.json({
    token: session.csrfToken,
  })
})

// Protected endpoint (requires CSRF token)
app.post('/api/change-email', (req, res) => {
  const sessionId = req.cookies.sessionId
  const { session } = getSession(sessionId)

  if (!session.username) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { email, csrfToken } = req.body

  if (!validateCsrfToken(csrfToken, session.csrfToken)) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'Request blocked: Missing or invalid CSRF token',
    })
  }

  res.json({
    success: true,
    message: `Email changed to ${email}`,
    email,
  })
})

// Unprotected endpoint (vulnerable to CSRF)
app.post('/api/change-email-no-token', (req, res) => {
  const sessionId = req.cookies.sessionId
  const { session } = getSession(sessionId)

  if (!session.username) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { email } = req.body

  // No CSRF token validation - VULNERABLE!
  res.json({
    success: true,
    message: `Email changed to ${email} (NO CSRF PROTECTION!)`,
    email,
    warning: 'This endpoint is vulnerable to CSRF attacks',
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`⚠️  WARNING: This is a demo server, NOT for production use!`)
})

