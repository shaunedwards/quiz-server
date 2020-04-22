class GameManager {
  constructor() {
    this.games = {};
  }
  
  addGame(roomID, game) {
    this.games[roomID] = game;
  }
  
  removeGame(roomID) {
    this.games[roomID] = undefined;
  }

  getGameById(roomID) {
    return this.games[roomID];
  }
}

module.exports = GameManager;
