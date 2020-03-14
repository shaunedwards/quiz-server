const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Game = require('../models/game');
const { isAuthenticated } = require('../middlewares/auth');

router.get('/', isAuthenticated, (req, res, next) => {
  res.json({
    message: `Hi, ${req.user.name}!`,
    user: req.user
  });
});

router.get('/games', isAuthenticated, (req, res, next) => {
  const limit = Number(req.query.limit) || 0;
  Game.find({ created_by: req.user._id })
    .limit(limit)
    .populate('subject')
    .populate('created_by')
    .exec()
    .then(games => res.json(games))
    .catch(next);
});

router.get('/favourites', isAuthenticated, (req, res, next) => {
  const limit = Number(req.query.limit) || 0;
  Game.find()
    .where('_id')
    .in(req.user.favourites)
    .limit(limit)
    .populate('subject')
    .populate('created_by')
    .exec()
    .then(favourites => res.json(favourites))
    .catch(next);
});

router.post('/favourites', isAuthenticated, (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then(user => {
      user.favourite(req.query.qid);
      res.json(user);
    })
    .catch(next);
});

router.delete('/favourites', isAuthenticated, (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then(user => {
      user.unfavourite(req.query.qid);
      res.json(user);
    })
    .catch(next);
});

module.exports = router;