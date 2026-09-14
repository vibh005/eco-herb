import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import passport from 'passport'

import authRoutes        from './routes/auth.js'
import productRoutes     from './routes/products.js'
import categoryRoutes    from './routes/categories.js'
import orderRoutes       from './routes/orders.js'
import uploadRoutes      from './routes/upload.js'
import adminProductRoutes  from './routes/admin/products.js'
import adminCategoryRoutes from './routes/admin/categories.js'
import adminOrderRoutes    from './routes/admin/orders.js'
import { startKeepAlive } from './keep-alive.js'

const app  = express()
const PORT = process.env.PORT || 4000

// ── Trust Render's proxy (required for rate limiting + OAuth) ─
app.set('trust proxy', 1)

// ── Security middleware ───────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin:      process.env.FRONTEND_URL,
  credentials: true,
}))

// ── Logging ───────────────────────────────────────────────────
app.use(morgan('dev'))

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Passport (for Google OAuth — no session) ─────────────────
app.use(passport.initialize())

// ── Rate limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
})
app.use('/api/', limiter)

// ── Health check (also used by keep-alive ping) ───────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/products',   productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders',     orderRoutes)
app.use('/api/upload',     uploadRoutes)

// Admin routes
app.use('/api/admin/products',   adminProductRoutes)
app.use('/api/admin/categories', adminCategoryRoutes)
app.use('/api/admin/orders',     adminOrderRoutes)

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

// ── Start server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌿 Eco Herb server running on port ${PORT}`)
  startKeepAlive()
})
