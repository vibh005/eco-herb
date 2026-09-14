import express from 'express'
import pool from '../db.js'

const router = express.Router()

// GET /api/products — public, supports ?category=&sort=&search=&featured=
router.get('/', async (req, res) => {
  try {
    const { category, sort = 'created_at-desc', search, featured } = req.query

    let where = ['active = TRUE']
    const params = []

    if (category && category !== 'all') {
      params.push(category)
      where.push(`category = $${params.length}`)
    }

    if (featured === 'true') {
      where.push('is_featured = TRUE')
    }

    if (search) {
      params.push(`%${search}%`)
      where.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`)
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const sortMap = {
      'created_at-desc': 'created_at DESC',
      'price-asc':       'price ASC',
      'price-desc':      'price DESC',
      'name-asc':        'name ASC',
    }
    const orderClause = `ORDER BY ${sortMap[sort] || 'created_at DESC'}`

    const { rows } = await pool.query(
      `SELECT * FROM products ${whereClause} ${orderClause}`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET /api/products/:id — single product
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

export default router
