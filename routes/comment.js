const express = require('express');
const router = express.Router();
const models = require('../models');

// POST is add
router.post('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId || !userLogin) {
    res.json({
      ok: false
    });
  } else {
    const post = req.body.post;
    const body = req.body.body;
    const parent = req.body.parent;

    if (!body) {
      res.json({
        ok: false,
        error: 'Empty comment'
      });
    }

    try {
      if (!parent) {
        await models.Comment.create({
          post,
          body,
          owner: userId
        });
        res.json({
          ok: true,
          body,
          login: userLogin
        });
      } else {
        const parentComment = await models.Comment.findById(parent);
        if (!parentComment) {
          res.json({
            ok: false
          });
        } else {
          const comment = await models.Comment.create({
            post,
            body,
            parent,
            owner: userId
          });

          await models.Comment.findByIdAndUpdate(
            parent,
            { $push: { children: comment.id } },
            { new: true }
          );

          // const children = parentComment.children;
          // children.push(comment.id);
          // parentComment.children = children;
          // await parentComment.save();

          res.json({
            ok: true,
            body,
            login: userLogin
          });
        }
      }
    } catch (e) {
      res.json({
        ok: false
      });
    }
  }
});

// router.get('/all', async (req, res) => {
//   const all = await models.Comment.find();
//   console.log(all);
//
//   res.json(all);
// });

module.exports = router;
