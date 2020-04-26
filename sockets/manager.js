class GameManager {
  constructor() {
    this.games = {};
  }
  
  addGame(roomID, game) {
    this.games[roomID] = game;
  }
  
  removeGame(roomID) {
    delete this.games[roomID];
  }

  getGameById(roomID) {
    return this.games[roomID];
  }
}

module.exports = GameManager;
