class Player {
  constructor(nickname) {
    this.nickname = nickname;
    this.score = 0;
    this.streak = 0;
    this.correct = 0;
    this.incorrect = 0;
    this.feedback = false;
    this.hasAnswered = false;
    this.answerHistory = [];
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

  addAnswer(answer) {
    this.answerHistory.push(answer);
  }

  getTotalCorrect() {
    return this.answerHistory.filter(answer => answer.isCorrect).length;
  }
}

module.exports = Player;
