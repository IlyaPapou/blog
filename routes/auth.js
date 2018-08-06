const express = require('express');
const router = express.Router();
const models = require('../models');
const bcrypt = require('bcrypt-nodejs');

//POST is registered
router.post('/register', async (req, res) => {
  const login = req.body.login;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  if (!login || !password || !passwordConfirm) {
    const fields = [];
    if (!login) fields.push('login');
    if (!password) fields.push('password');
    if (!passwordConfirm) fields.push('passwordConfirm');
    res.json({
      ok: false,
      error: "All fields shouldn't be empty",
      fields
    });
  } else if (!/^[a-zA-Z0-9]+$/.test(login)) {
    res.json({
      ok: false,
      error: 'Use numbers & latin letters',
      fields: ['login']
    });
  } else if (login.length < 3 || login.length > 16) {
    res.json({
      ok: false,
      error: 'Length of the login 3 - 16 symbols',
      fields: ['login']
    });
  } else if (password !== passwordConfirm) {
    res.json({
      ok: false,
      error: "Passwords doesn't match!",
      fields: ['password', 'passwordConfirm']
    });
  } else if (login.password < 6 || login.length > 16) {
    res.json({
      ok: false,
      error: 'Length of the password 6 - 16 symbols',
      fields: ['login']
    });
  } else {
    try {
      let user = await models.User.findOne({ login });
      if (!user) {
        bcrypt.hash(password, null, null, async (err, hash) => {
          user = await models.User.create({
            login,
            password: hash
          });
          req.session.userId = user.id;
          req.session.userLogin = user.login;
          res.json({
            ok: true
          });
        });
      } else {
        res.json({
          ok: false,
          error: 'Name is already taken',
          field: login
        });
      }
    } catch (e) {
      res.json({ ok: false, error: 'Error' });
    }
  }
});

//POST is logged
router.post('/login', async (req, res) => {
  const login = req.body.login;
  const password = req.body.password;
  if (!login || !password) {
    const fields = [];
    if (!login) fields.push('login');
    if (!password) fields.push('password');
    res.json({
      ok: false,
      error: "All fields shouldn't be empty",
      fields
    });
  } else {
    try {
      let user = await models.User.findOne({ login });
      if (!user) {
        res.json({
          ok: false,
          error: "Login or password doesn't match",
          fields: ['login', 'password']
        });
      } else {
        bcrypt.compare(password, user.password, function(err, result) {
          if (!result) {
            res.json({
              ok: false,
              error: "Login or password doesn't match",
              fields: ['login', 'password']
            });
          } else {
            req.session.userId = user.id;
            req.session.userLogin = user.login;
            res.json({
              ok: true
            });
          }
        });
      }
    } catch (e) {
      res.json({
        ok: false,
        error: 'Error, try once again'
      });
    }
  }
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
