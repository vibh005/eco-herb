import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { requireAdmin } from '../middleware/admin.js'

const router = express.Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Use memory storage so we can stream to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only images are allowed'))
    }
  },
})

// POST /api/upload — admin only, upload one image to Cloudinary
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' })

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:          'eco-herb/products',
          transformation:  [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        },
        (error, result) => (error ? reject(error) : resolve(result))
      )
      stream.end(req.file.buffer)
    })

    res.json({ url: result.secure_url, public_id: result.public_id })
  } catch (err) {
    console.error('Cloudinary upload error:', err)
    res.status(500).json({ error: 'Upload failed' })
  }
})

export default router
