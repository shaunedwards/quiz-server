const fetch = require('node-fetch');
const socketIO = require('socket.io');

async function getRandomQuiz() {
  const response = await fetch('http://localhost:5000/games');
  const data = await response.json();
  return data[Math.floor(Math.random() * data.length)];
}

async function init(server) {
  const io = socketIO(server);
  let quiz = await getRandomQuiz();
  const game = {
    players: {},
    title: quiz.title,
    currentQuestion: 0,
    question: quiz.questions[0],
    isOver: false
  };

  const emitGameState = () => io.emit('gamestate', game);

  setInterval(async () => {
    if (game.isOver) await newGame();
    nextQuestion();
    io.emit('question', game.question);
    console.log('new question', game.question);
  }, game.question.timer * 1000);

  const nextQuestion = () => {
    game.currentQuestion++;
    game.question = quiz.questions[game.currentQuestion];
    game.isOver = game.currentQuestion === quiz.questions.length - 1;
  }

  const newGame = async () => {
    quiz = await getRandomQuiz();
    game.title = quiz.title;
    game.currentQuestion = -1;
    game.question = quiz.questions[0];
    game.isOver = false;
    resetScores();
    emitGameState();
    io.emit('question', game.question);
  }

  const resetScores = () => {
    Object.entries(game.players).forEach(([_, player]) => {
      player.score = 0;
      player.streak = 0;
      player.correct = 0;
      player.incorrect = 0;
    });
  }

  io.on('connection', (socket) => {
    console.log(`${socket.id} joined!`);

    socket.on('nickname', (nick) => {
      const player = {
        nickname: nick,
        score: 0,
        streak: 0,
        correct: 0,
        incorrect: 0
      };
      game.players[socket.id] = player;
      console.log(game);
      emitGameState();
      socket.emit('question', game.question);
    });
    
    socket.on('answer', (answer, callback) => {
      console.log(answer);
      if (quiz.questions[game.currentQuestion].correct_answers.includes(answer)) {
        game.players[socket.id].correct += 1;
        game.players[socket.id].streak += 1;
        game.players[socket.id].score += quiz.questions[game.currentQuestion].points;
        callback(true);
      } else {
        game.players[socket.id].incorrect += 1;
        game.players[socket.id].streak = 0;
        callback(false);
      }
      console.log(game);
      emitGameState();
    });

    socket.on('disconnect', () => {
      delete game.players[socket.id];
      console.log(`${socket.id} disconnected.`);
      emitGameState();
    });
  });
}

module.exports = init;
