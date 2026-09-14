import express from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Configure Passport Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email    = profile.emails[0].value
        const isAdmin  = email === process.env.ADMIN_EMAIL

        // Upsert user into DB
        const { rows } = await pool.query(
          `INSERT INTO users (google_id, email, name, avatar, is_admin)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (google_id) DO UPDATE
             SET name = EXCLUDED.name,
                 avatar = EXCLUDED.avatar,
                 is_admin = $5
           RETURNING *`,
          [
            profile.id,
            email,
            profile.displayName,
            profile.photos?.[0]?.value || null,
            isAdmin,
          ]
        )
        done(null, rows[0])
      } catch (err) {
        done(err, null)
      }
    }
  )
)

// Google OAuth — kick off
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))

// Google OAuth — callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=1` }),
  (req, res) => {
    const token = jwt.sign(
      {
        id:       req.user.id,
        email:    req.user.email,
        name:     req.user.name,
        avatar:   req.user.avatar,
        is_admin: req.user.is_admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
  }
)

// Get current user (verify token + refresh user data)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])
    if (!rows[0]) return res.status(404).json({ error: 'User not found' })
    const u = rows[0]
    res.json({
      id:       u.id,
      email:    u.email,
      name:     u.name,
      avatar:   u.avatar,
      is_admin: u.is_admin,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
