const express = require('express');
const router = express.Router();

const {
  isCreator,
  isAuthenticated
} = require('../middlewares/auth');
const Game = require('../models/game');

router.get('/', (req, res, next) => {
  Game.find({ public: true, draft: false })
    .populate('created_by').exec()
    .then(games => res.json(games))
    .catch(next);
});

router.get('/:id', (req, res, next) => {
  Game.findById(req.params.id)
    .populate('created_by')
    .populate('subject')
    .exec()
    .then(game => res.json(game))
    .catch(next);
});

router.post('/', isAuthenticated, (req, res, next) => {
  req.body.created_by = req.user._id;
  new Game(req.body).save()
    .then(game => res.json(game))
    .catch(next);
});

router.put('/:id', isAuthenticated, isCreator, (req, res, next) => {
  Game.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(game => res.json(game))
    .catch(next);
});

router.delete('/:id', isAuthenticated, isCreator, (req, res, next) => {
  Game.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(204))
    .catch(next);
});

module.exports = router;