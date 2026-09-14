import express from 'express'
import pool from '../db.js'

const router = express.Router()

// GET /api/categories — public
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC, name ASC')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

export default router
