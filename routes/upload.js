const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Sharp = require('sharp');
const config = require('../config');
const mkdirp = require('mkdirp');
const models = require('../models');
const diskStorage = require('../utils/diskStorage');

const rs = () =>
  Math.random()
    .toString(36)
    .slice(-3);

const storage = diskStorage({
  destination: (req, file, cb) => {
    const dir = '/' + rs() + '/' + rs();
    req.dir = dir;
    mkdirp(config.DESTINATION + dir, err => cb(err, config.DESTINATION + dir));
    // cb(null, config.DESTINATION + dir);
  },
  filename: async (req, file, cb) => {
    const userId = req.session.userId;
    const fileName = Date.now().toString(36) + path.extname(file.originalname);
    const dir = req.dir;
    const postId = req.body.postId;

    // find post
    const post = await models.Post.findById(postId);

    if (!post) {
      const err = new Error('Post not found');
      err.code = 'POSTNOTFOUND';
      return cb(err);
    } else {
      // upload
      const upload = await models.Upload.create({
        owner: userId,
        path: dir + '/' + fileName
      });

      // const uploads = post.uploads;
      // uploads.push(upload.id);
      // post.uploads = uploads;
      // await post.save;

      // write to post
      await models.Post.findByIdAndUpdate(
        postId,
        { $push: { uploads: { $each: [upload.id], $position: 0 } } },
        { new: true }
      );

      //
      req.filePath = dir + '/' + fileName;
    }
    cb(null, fileName);
  },
  sharp: (req, file, cb) => {
    const resizer = Sharp()
      .resize(1024, 768)
      .max()
      .withoutEnlargement()
      .toFormat('jpeg')
      .jpeg({
        quality: 80,
        progressive: true
      });
    cb(null, resizer);
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
    try {
      let error = '';
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          error = 'Image should be less then 2mb';
        } else if (err.code === 'EXTENSION') {
          error = 'Image extension should be .jpg, .jpeg or .png';
        } else if (err.code === 'POSTNOTFOUND') {
          error = 'Smth wrong! Please reload the page';
        }
      }
      res.json({
        ok: !error,
        error,
        filePath: req.filePath
      });
    } catch (e) {
      console.log(e);
    }
  });
});

module.exports = router;
