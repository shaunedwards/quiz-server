require('dotenv').config();
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const express = require('express');
const passport = require('passport');
const session = require('express-session');

require('./db/connection');
const User = require('./models/user');
const LdapStrategy = require('./auth/ldap');
const LocalStrategy = require('./auth/local');

const app = express();
const server = http.createServer(app);
require('./sockets')(server);

// passport setup
passport.serializeUser((user, done) => done(null, user.uid));
passport.deserializeUser((uid, done) => {
  User.findOne({ uid }, (err, user) => {
    done(err, user);
  });
});
passport.use(LdapStrategy);
passport.use(LocalStrategy);

// middlewares
app.use(cors({
  credentials: true,
  origin: [
    'https://quiz.sme.dev',
    'http://localhost:3000',
    'http://mmp-sme4.dcs.aber.ac.uk',
    'http://mmp-sme4.dcs.aber.ac.uk:3000'
  ]
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 86400000 // 24h
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/', require('./routes/account'));
app.use('/users', require('./routes/users'));
app.use('/games', require('./routes/games'));
app.use('/subjects', require('./routes/subjects'));

// error handling
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') err.status = 400;
  const [field] = err.errors ? Object.keys(err.errors) : [];
  res.status(err.status || 500).json({
    error: field ? err.errors[field].message : err.message
  });
});

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Listening for requests on port ${port}`));

module.exports = app;
