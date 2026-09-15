import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import passport from 'passport'

import authRoutes          from '../server/routes/auth.js'
import productRoutes       from '../server/routes/products.js'
import categoryRoutes      from '../server/routes/categories.js'
import orderRoutes         from '../server/routes/orders.js'
import uploadRoutes        from '../server/routes/upload.js'
import adminProductRoutes  from '../server/routes/admin/products.js'
import adminCategoryRoutes from '../server/routes/admin/categories.js'
import adminOrderRoutes    from '../server/routes/admin/orders.js'

const app = express()

// Trust Vercel's proxy (required for rate limiting)
app.set('trust proxy', 1)

// Security
app.use(helmet())
app.use(cors({
  origin:      process.env.FRONTEND_URL || true,
  credentials: true,
}))

// Logging
app.use(morgan('dev'))

// Body parsing
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

// Passport (Google OAuth)
app.use(passport.initialize())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
})
app.use('/api/', limiter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth',       authRoutes)
app.use('/api/products',   productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders',     orderRoutes)
app.use('/api/upload',     uploadRoutes)

// Admin routes
app.use('/api/admin/products',   adminProductRoutes)
app.use('/api/admin/categories', adminCategoryRoutes)
app.use('/api/admin/orders',     adminOrderRoutes)

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

export default app
