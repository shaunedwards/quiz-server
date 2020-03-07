const express = require('express');
const passport = require('passport');
const router = express.Router();

const User = require('../models/user');
const { isAuthenticated } = require('../middlewares/auth');

router.post('/login', passport.authenticate('ldapauth', { session: true }), async (req, res, next) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) {
    const newUser = await User.create({
      uid: req.user.uid,
      email: req.user.mail,
      name: req.user.displayName
    });
    console.log('new user created', newUser);
  } else {
    user.last_login = Date.now();
    await user.save();
  }
  res.json({
    message: 'Login successful',
    user: req.user
  });
});

router.get('/logout', (req, res, next) => {
  req.session.destroy(() => {
    req.logout();
    res.clearCookie('connect.sid');
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