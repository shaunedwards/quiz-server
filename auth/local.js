const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

module.exports = new LocalStrategy((username, password, done) => {
  User.findOne({ uid: username }, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false, 'invalid username');
    if (!user.verifyPassword(password)) return done(null, false, 'invalid password');
    return done(null, user);
  });
});
