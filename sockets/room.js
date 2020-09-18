const shuffle = require('../helpers/shuffle');

class Room {
  constructor(host, quiz, roomID, options) {
    this.host = host;
    this.quiz = quiz;
    this.roomID = roomID;
    this.state = 'LOBBY';
    this.currentIdx = 0;
    this.players = new Map();
    this.isOver = false;
    this.numAnswered = 0;
    this.options = options;
  }

  shuffleQuestions() {
    shuffle(this.quiz.questions);
  }

  shuffleAnswers() {
    this.quiz.questions.forEach(question => shuffle(question.choices));
  }

  nextQuestion() {
    // pre-question checks before moving on...
    const question = this.getCurrentQuestion();
    const answers = this.getCurrentAnswers();
    this.players.forEach(player => {
      // if `hasAnswered` is false, push to answer history + reset streak
      if (!player.hasAnswered) {
        player.streak = 0;
        player.answerHistory.push({
          question: {
            ...question,
            answers
          },
          answer: null,
          isCorrect: false
        });
      }
      // reset `hasAnswered` for all players so they can receive points
      player.hasAnswered = false;
    });
    // is the game over yet?
    this.isOver = this.currentIdx === this.quiz.questions.length - 1;
    if (this.isOver) return;
    this.currentIdx++;
    this.numAnswered = 0;
  }

  addPlayer(socket, player) {
    this.players.set(socket.id, player);
  }

  removePlayer(socket) {
    const player = this.getPlayerBySocket(socket);
    if (player && player.hasAnswered) this.numAnswered--;
    this.players.delete(socket.id);
  }

  getPlayerBySocket(socket) {
    return this.players.get(socket.id);
  }

  getCurrentQuestion() {
    let question = { ...this.quiz.questions[this.currentIdx] };
    question.answers = undefined;
    return question;
  }

  getCurrentAnswers() {
    return this.quiz.questions[this.currentIdx].answers;
  }
  
  getNumQuestions() {
    return this.quiz.questions.length;
  }

  getNumPlayers() {
    return this.players.size;
  }

  getTotalCorrect() {
    let total = 0;
    this.players.forEach(player => total += player.getTotalCorrect());
    return total;
  }

  toJSON() {
    return {
      host: this.host,
      roomID: this.roomID,
      title: this.quiz.title,
      state: this.state,
      players: Object.fromEntries(this.players),
      isOver: this.isOver,
      numAnswered: this.numAnswered,
      numQuestions: this.getNumQuestions(),
      currentQuestion: this.getCurrentQuestion(),
      progress: `Question ${this.currentIdx + 1} of ${this.getNumQuestions()}`
    }
  }
}

module.exports = Room;
