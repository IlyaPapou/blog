const express = require('express');
const router = express.Router();
const models = require('../models');
const TurndownService = require('turndown');

router.get('/add', (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId && !userLogin) {
    res.redirect('/');
  } else {
    res.render('post/add', {
      user: {
        id: userId,
        login: userLogin
      }
    });
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
    const body = req.body.body;
    const turndownService = new TurndownService();

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
    } else if (body.length < 10 || body.length > 10000) {
      res.json({
        ok: false,
        error: 'Length of the text 10 - 10000 symbols',
        fields: ['body']
      });
    } else {
      try {
        let post = await models.Post.create({
          title,
          body: turndownService.turndown(body),
          owner: userId
        });
        if (post) {
          res.json({
            ok: true
          });
        }
      } catch (e) {
        res.json({
          ok: false,
          error: 'Error'
        });
      }
    }
  }
});

module.exports = router;
