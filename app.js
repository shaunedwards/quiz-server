require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

const User = require('./models/user');
const LdapStrategy = require('./auth/ldap');

const app = express();

// passport setup
passport.serializeUser((user, done) => done(null, user.uid));
passport.deserializeUser((uid, done) => {
  User.findOne({ uid }, (err, user) => {
    done(err, user);
  });
});
passport.use(LdapStrategy);

// middlewares
app.use(cors({
  credentials: true,
  origin: [
    'http://localhost:3000',
    'http://mmp-sme4.dcs.aber.ac.uk:3000'
  ]
}));
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
  const [ field ] = err.errors ? Object.keys(err.errors) : [];
  res.status(err.status || 500).json({
    error: field ? err.errors[field].message : err.message
  });
});

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening for requests on port ${port}`));