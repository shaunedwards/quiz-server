const express = require('express');
const router = express.Router();

const Game = require('../models/game');
const Subject = require('../models/subject');

router.get('/', (req, res, next) => {
  Subject.find()
    .then(subjects => res.json(subjects))
    .catch(next);
});

router.get('/:id', (req, res, next) => {
  Game.find({
    public: true,
    draft: false,
    subject: req.params.id
  })
    .then(games => res.json(games))
    .catch(next);
});

module.exports = router;