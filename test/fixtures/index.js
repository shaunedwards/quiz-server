const mongoose = require('mongoose');

const users = require('./users');
const games = require('./games');
const subjects = require('./subjects');

module.exports = {
  users: users.map(user => {
    user._id = mongoose.Types.ObjectId(user._id);
    user.last_login = new Date(user.last_login);
    return user;
  }),
  games: games.map(game => {
    game._id = mongoose.Types.ObjectId(game._id);
    game.subject = mongoose.Types.ObjectId(game.subject);
    game.created_by = mongoose.Types.ObjectId(game.created_by);
    game.questions.forEach(question => question._id = mongoose.Types.ObjectId(question._id));
    return game;
  }),
  subjects: subjects.map(subject => {
    subject._id = mongoose.Types.ObjectId(subject._id);
    return subject;
  })
}
