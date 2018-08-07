const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.jpeg' && ext !== '.jpg' && ext !== '.png') {
      const err = new Error('Extension');
      err.code = 'EXTENSION';
      return cb(err);
    } else {
      cb(null, true);
    }
  }
}).single('file');

// POST image
router.post('/image', (req, res) => {
  upload(req, res, err => {
    let error = '';
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        error = 'Image should be less then 2mb';
      } else if (err.code === 'EXTENSION') {
        error = 'Image extension should be .jpg, .jpeg or .png';
      }

      res.json({
        ok: !!error,
        error
      });
    }
  });
});

module.exports = router;
