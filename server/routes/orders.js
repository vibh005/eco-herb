import express from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// POST /api/orders — create order in DB + Razorpay order
router.post('/', requireAuth, async (req, res) => {
  const { items, subtotal, shipping, total, shippingAddress } = req.body

  if (!items?.length || !shippingAddress || !total) {
    return res.status(400).json({ error: 'Missing required order fields' })
  }

  try {
    // Create Razorpay order first (amount in paise)
    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(total * 100),
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
    })

    // Create order in DB
    const { rows } = await pool.query(
      `INSERT INTO orders
        (user_id, items, subtotal, shipping, total, shipping_address, status, payment_status, razorpay_order_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'pending', $7)
       RETURNING *`,
      [
        req.user.id,
        JSON.stringify(items),
        subtotal,
        shipping,
        total,
        JSON.stringify(shippingAddress),
        rzpOrder.id,
      ]
    )

    res.json({
      orderId:        rows[0].id,
      razorpayOrderId: rzpOrder.id,
      amount:         rzpOrder.amount,
      currency:       rzpOrder.currency,
      keyId:          process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// POST /api/orders/:id/verify — verify Razorpay payment signature
router.post('/:id/verify', requireAuth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification fields' })
  }

  // HMAC-SHA256 signature check
  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed' })
  }

  try {
    const { rows } = await pool.query(
      `UPDATE orders
       SET status = 'confirmed',
           payment_status = 'paid',
           razorpay_payment_id = $1,
           updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [razorpay_payment_id, req.params.id, req.user.id]
    )

    if (!rows[0]) return res.status(404).json({ error: 'Order not found' })
    res.json({ success: true, order: rows[0] })
  } catch (err) {
    console.error('Verify payment error:', err)
    res.status(500).json({ error: 'Failed to update order' })
  }
})

// GET /api/orders/:id — get single order (owner only)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

export default router
