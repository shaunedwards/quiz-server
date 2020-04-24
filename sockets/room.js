const shuffle = require('../helpers/shuffle');

class Room {
  constructor(host, quiz, roomID, options) {
    this.host = host;
    this.quiz = quiz;
    this.roomID = roomID;
    this.state = 'LOBBY';
    this.currentIdx = 0;
    this.players = {};
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
    this.currentIdx++;
    this.numAnswered = 0;
    this.isOver = this.currentIdx === this.quiz.questions.length - 1;
  }

  addPlayer(socket, player) {
    this.players[socket.id] = player;
  }

  removePlayer(socket) {
    if (this.numAnswered > 0) {
      this.numAnswered--;
    }
    this.players[socket.id] = undefined;
  }

  getPlayerBySocket(socket) {
    return this.players[socket.id];
  }

  getCurrentQuestion() {
    let question = { ...this.quiz.questions[this.currentIdx] };
    question.correct_answers = undefined;
    return question;
  }

  getCurrentAnswers() {
    return this.quiz.questions[this.currentIdx].correct_answers;
  }
  
  getNumQuestions() {
    return this.quiz.questions.length;
  }

  getNumPlayers() {
    return Object.keys(this.players).length;
  }

  getTotalCorrect() {
    let total = 0;
    Object.entries(this.players).forEach(([_, player]) => {
      total += player.getTotalCorrect()
    });
    return total;
  }

  toJSON() {
    return {
      host: this.host,
      roomID: this.roomID,
      title: this.quiz.title,
      state: this.state,
      players: this.players,
      isOver: this.isOver,
      numAnswered: this.numAnswered,
      numQuestions: this.getNumQuestions(),
      currentQuestion: this.getCurrentQuestion(),
      progress: `Question ${this.currentIdx + 1} of ${this.getNumQuestions()}`
    }
  }
}

module.exports = Room;
