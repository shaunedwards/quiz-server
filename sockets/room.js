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
    // pre-question checks before moving on...
    const question = this.getCurrentQuestion();
    const correct_answers = this.getCurrentAnswers();
    Object.entries(this.players).forEach(([_, player]) => {
      // if `hasAnswered` is false, push to answer history + reset streak
      if (!player.hasAnswered) {
        player.streak = 0;
        player.answerHistory.push({
          question: {
            ...question,
            correct_answers
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
    this.players[socket.id] = player;
  }

  removePlayer(socket) {
    if (this.numAnswered > 0) {
      this.numAnswered--;
    }
    delete this.players[socket.id];
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
      total += player.getTotalCorrect();
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
