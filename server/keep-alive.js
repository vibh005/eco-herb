/**
 * keep-alive.js — prevents Render free tier from sleeping
 *
 * HOW IT WORKS:
 * - node-cron self-pings /health every 14 minutes (Render sleeps after 15 min)
 * - For full uptime: set up UptimeRobot (free) to ping your Render URL every 5 min
 *   → https://uptimerobot.com
 */

import cron from 'node-cron'

export function startKeepAlive() {
  const url = process.env.BACKEND_URL

  if (!url) {
    console.warn('[keep-alive] BACKEND_URL not set — skipping self-ping')
    return
  }

  // Ping every 14 minutes
  cron.schedule('*/14 * * * *', async () => {
    try {
      const res = await fetch(`${url}/health`)
      const data = await res.json()
      console.log(`[keep-alive] self-ping OK — ${data.status} at ${new Date().toISOString()}`)
    } catch (err) {
      console.error('[keep-alive] self-ping failed:', err.message)
    }
  })

  console.log('[keep-alive] Self-ping started (every 14 min)')
}
