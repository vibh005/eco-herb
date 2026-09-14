import express from 'express'
import pool from '../../db.js'
import { requireAdmin } from '../../middleware/admin.js'

const router = express.Router()
router.use(requireAdmin)

// GET /api/admin/categories
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC, name ASC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// POST /api/admin/categories
router.post('/', async (req, res) => {
  const { name, slug, description, emoji, sort_order } = req.body
  if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' })

  try {
    const { rows: existing } = await pool.query('SELECT COUNT(*) FROM categories')
    const order = sort_order ?? Number(existing[0].count) + 1

    const { rows } = await pool.query(
      `INSERT INTO categories (name, slug, description, emoji, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), slug.trim(), description?.trim() || '', emoji || '🌿', order]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Slug already exists' })
    console.error(err)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// PUT /api/admin/categories/:id
router.put('/:id', async (req, res) => {
  const { name, slug, description, emoji, sort_order } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE categories SET name=$1, slug=$2, description=$3, emoji=$4, sort_order=$5
       WHERE id=$6 RETURNING *`,
      [name?.trim(), slug?.trim(), description?.trim() || '', emoji || '🌿', sort_order ?? 0, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Category not found' })
    res.json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Slug already exists' })
    console.error(err)
    res.status(500).json({ error: 'Failed to update category' })
  }
})

// DELETE /api/admin/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Category not found' })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

export default router
