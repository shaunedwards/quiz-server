const express = require('express');
const passport = require('passport');
const router = express.Router();

const User = require('../models/user');
const { isAuthenticated } = require('../middlewares/auth');

async function updateLastLogin(user) {
  user.last_login = Date.now();
  await user.save();
}

router.post('/register', async (req, res, next) => {
  const { username: uid, password } = req.body;
  const user = await User.findOne({ uid });
  if (user) return res.status(400).json({ error: 'This username is already in use. Please choose another.' });
  const newUser = await new User({ uid, password });
  newUser.save((err, user) => {
    if (err) return next(err);
    res.status(201).json(user);
  });
});

router.post('/auth/local', (req, res, next) => {
  passport.authenticate('local', { session: true }, async (err, user, info) => {
    if (err || !user) return res.status(401).json({ error: info });
    await updateLastLogin(user);
    req.login(user, () => {
      res.json({
        message: 'Login successful',
        user: req.user
      });
    });
  })(req, res, next);
});

router.post('/auth/ldap', passport.authenticate('ldapauth', { session: true }), async (req, res, next) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) {
    await User.create({
      uid: req.user.uid,
      email: req.user.mail,
      name: req.user.displayName
    });
  } else {
    await updateLastLogin(user);
  }
  res.json({
    message: 'Login successful',
    user: req.user
  });
});

router.get('/logout', (req, res, next) => {
  req.session.destroy(() => {
    req.logout();
    res.clearCookie('sid');
    res.sendStatus(200);
  });
});

router.get('/session', isAuthenticated, (req, res, next) => {
  res.status(200).json({
    sid: req.session.id,
    user: req.user
  });
});

module.exports = router;
