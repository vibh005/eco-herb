import express from 'express'
import pool from '../../db.js'
import { requireAdmin } from '../../middleware/admin.js'

const router = express.Router()

// All admin product routes require admin
router.use(requireAdmin)

// GET /api/admin/products — all products (no active filter)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// POST /api/admin/products — create product
router.post('/', async (req, res) => {
  const {
    name, description, price, original_price, category,
    weight, stock, active, is_featured, is_new,
    images, benefits, ingredients,
  } = req.body

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'name, price, and category are required' })
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO products
        (name, description, price, original_price, category, weight, stock,
         active, is_featured, is_new, images, benefits, ingredients)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        name.trim(),
        description?.trim() || '',
        Number(price),
        original_price ? Number(original_price) : null,
        category,
        weight ? Number(weight) : null,
        Number(stock) || 0,
        active ?? true,
        is_featured ?? false,
        is_new ?? false,
        images || [],
        benefits || [],
        ingredients || [],
      ]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// PUT /api/admin/products/:id — update product
router.put('/:id', async (req, res) => {
  const {
    name, description, price, original_price, category,
    weight, stock, active, is_featured, is_new,
    images, benefits, ingredients,
  } = req.body

  try {
    const { rows } = await pool.query(
      `UPDATE products SET
        name = $1, description = $2, price = $3, original_price = $4,
        category = $5, weight = $6, stock = $7, active = $8,
        is_featured = $9, is_new = $10, images = $11,
        benefits = $12, ingredients = $13, updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        name?.trim(),
        description?.trim() || '',
        Number(price),
        original_price ? Number(original_price) : null,
        category,
        weight ? Number(weight) : null,
        Number(stock) || 0,
        active ?? true,
        is_featured ?? false,
        is_new ?? false,
        images || [],
        benefits || [],
        ingredients || [],
        req.params.id,
      ]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// PATCH /api/admin/products/:id — partial update (toggle active, stock, etc.)
router.patch('/:id', async (req, res) => {
  const allowed = ['active', 'is_featured', 'is_new', 'stock']
  const updates = []
  const values  = []

  for (const key of allowed) {
    if (key in req.body) {
      values.push(req.body[key])
      updates.push(`${key} = $${values.length}`)
    }
  }

  if (!updates.length) return res.status(400).json({ error: 'No valid fields to update' })

  values.push(req.params.id)
  try {
    const { rows } = await pool.query(
      `UPDATE products SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    )
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE /api/admin/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Product not found' })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router
