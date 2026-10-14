// Image storage: uploads land on local disk via multer, then go to Cloudinary
// when CLOUDINARY_URL is set (recommended for production). Without it, files
// are served from /uploads like before.
const fs     = require('fs')
const path   = require('path')
const multer = require('multer')

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const safe = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_')
      cb(null, `${Date.now()}-${safe}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      const err = new Error('Only JPEG, PNG and WebP images are allowed')
      err.status = 400
      return cb(err)
    }
    cb(null, true)
  },
})

let cloudinary = null
if (process.env.CLOUDINARY_URL) {
  cloudinary = require('cloudinary').v2   // reads CLOUDINARY_URL automatically
}

const backendUrl = () => process.env.BACKEND_URL || 'http://localhost:4000'

// Returns the public URL for an uploaded multer file (or '' when none)
async function saveUpload(file) {
  if (!file) return ''
  if (!cloudinary) return `${backendUrl()}/uploads/${file.filename}`

  const result = await cloudinary.uploader.upload(file.path, { folder: 'metmomo' })
  fs.unlink(file.path, () => {})
  return result.secure_url
}

// Best-effort removal of an image previously returned by saveUpload
async function removeUpload(url) {
  if (!url) return
  if (url.includes('/uploads/')) {
    fs.unlink(path.join(UPLOAD_DIR, path.basename(url)), () => {})
  } else if (cloudinary && url.includes('res.cloudinary.com')) {
    const publicId = url.split('/upload/')[1]?.replace(/^v\d+\//, '').replace(/\.[^.]+$/, '')
    if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {})
  }
}

module.exports = { upload, saveUpload, removeUpload, UPLOAD_DIR }
