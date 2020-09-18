const Game = require('../models/game');

class GameManager {
  constructor() {
    this.games = new Map();
  }
  
  addGame(roomID, game) {
    this.games.set(roomID, game);
  }
  
  removeGame(roomID) {
    this.games.delete(roomID);
  }

  getGameById(roomID) {
    return this.games.get(roomID);
  }

  incrementDbStats(game) {
    Game.findOne({ _id: game.quiz._id }, (err, doc) => {
      if (err) throw err;
      let { total_hosted, total_correct, total_questions, total_players } = doc.stats;
      doc.stats = {
        total_hosted: total_hosted += 1,
        total_correct: total_correct += game.getTotalCorrect(),
        total_questions: total_questions += game.getNumQuestions(),
        total_players: total_players += game.getNumPlayers()
      }
      doc.save();
    });
  }

  saveGameHistory(game) {
    // TODO
  }
}

module.exports = GameManager;
