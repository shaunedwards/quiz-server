const Game = require('../models/game');

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.sendStatus(401);
}

async function isCreator(req, res, next) {
  const game = await Game.findById(req.params.id);
  if (game.created_by.equals(req.user._id)) return next();
  res.sendStatus(403);
}

module.exports = {
  isCreator,
  isAuthenticated
}
