import express from 'express'
import pool from '../../db.js'
import { requireAdmin } from '../../middleware/admin.js'

const router = express.Router()
router.use(requireAdmin)

// GET /api/admin/orders — all orders, newest first
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// GET /api/admin/orders/stats — dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM products)::int                                        AS products,
        (SELECT COUNT(*) FROM orders)::int                                          AS orders,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'paid') AS revenue,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending')::int                 AS pending_orders
    `)
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/admin/orders/recent — last 5 orders for dashboard
router.get('/recent', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5'
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch recent orders' })
  }
})

// PUT /api/admin/orders/:id/status — update order status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body
  const VALID = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!VALID.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  try {
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

export default router
