class Player {
  constructor(nickname) {
    this.nickname = nickname;
    this.score = 0;
    this.streak = 0;
    this.correct = 0;
    this.incorrect = 0;
    this.feedback = false;
    this.hasAnswered = false;
  }

  setCorrect(points) {
    this.score += points;
    this.correct += 1;
    this.streak += 1;
  }

  setIncorrect() {
    this.streak = 0;
    this.incorrect += 1;
  }
}

module.exports = Player;
