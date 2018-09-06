const express = require('express');
const router = express.Router();
const models = require('../models');
const tr = require('transliter');

router.get('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId && !userLogin) {
    res.redirect('/');
  } else {
    try {
      const post = await models.Post.findOne({
        owner: userId,
        status: 'draft'
      });

      if (post) {
        res.redirect(`/post/edit/${post.id}`);
      } else {
        const post = await models.Post.create({
          owner: userId,
          status: 'draft'
        });
        res.redirect(`/post/edit/${post.id}`);
      }
    } catch (e) {
      console.log(e);
    }
    // res.render('post/edit', {
    //   user: {
    //     id: userId,
    //     login: userLogin
    //   }
    // });
  }
});

//POST add
router.post('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId && !userLogin) {
    res.redirect('/');
  } else {
    const title = req.body.title.trim().replace(/ +(?=)/g, '');
    const body = req.body.body.trim();
    const postId = req.body.postId;
    const isDraft = !!req.body.isDraft;
    const url = `${tr.slugify(title)}-${Date.now().toString(36)}`;

    if (!title || !body) {
      const fields = [];
      if (!title) fields.push('title');
      if (!body) fields.push('body');
      res.json({
        ok: false,
        error: "All fields shouldn't be empty",
        fields
      });
    } else if (title.length < 2 || title.length > 100) {
      res.json({
        ok: false,
        error: 'Length of the title 2 - 100 symbols',
        fields: ['title']
      });
    } else if (body.length < 10 || body.length > 50000) {
      res.json({
        ok: false,
        error: 'Length of the text 10 - 50000 symbols',
        fields: ['body']
      });
    } else if (!postId) {
      res.json({
        ok: false,
        error: 'Error'
      });
    } else {
      try {
        const post = await models.Post.findOneAndUpdate(
          {
            _id: postId,
            owner: userId
          },
          {
            url,
            title,
            body,
            owner: userId,
            status: isDraft ? 'draft' : 'published'
          },
          { new: true }
        );

        if (!post) {
          res.json({
            ok: false,
            error: "Not your's post"
          });
        } else {
          res.json({
            ok: true,
            post
          });
        }
      } catch (e) {
        res.json({
          ok: false,
          error: JSON.stringify(e)
        });
      }
    }
  }
});

// POST edit
router.get('/edit/:id', async (req, res, next) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const id = req.params.id.trim().replace(/ +(?= )/g, '');

  if (!userId && !userLogin) {
    res.redirect('/');
  } else {
    try {
      const post = await models.Post.findById(id).populate('uploads');

      if (!post) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
      }
      res.render('post/edit', {
        post,
        user: {
          id: userId,
          login: userLogin
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
});

module.exports = router;
