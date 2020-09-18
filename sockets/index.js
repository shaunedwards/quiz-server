const socketIO = require('socket.io');
const generateName = require('sillyname');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 6);

const Room = require('./room');
const Player = require('./player');
const Manager = require('./manager');

const manager = new Manager();

async function init(server) {
  if (process.env.NODE_ENV === 'test') return;
  const io = socketIO(server);

  const emitGameState = (room) => {
    const game = manager.getGameById(room);
    io.to(room).emit('gamestate', game.toJSON());
  }

  const emitTimer = (room, timer) => {
    io.to(room).emit('timer', timer);
    let timeRemaining = setInterval(() => {
      if (timer === 1) return clearInterval(timeRemaining);
      io.to(room).emit('timer', --timer);
    }, 1000);
  }

  io.on('connection', (socket) => {
    socket.on('playerJoin', (room, callback) => {
      const game = manager.getGameById(room);
      if (!game || game.isOver) return callback(false);
      socket.join(room);
      socket.room = room;
      const nickname = generateName();
      const player = new Player(nickname);
      game.addPlayer(socket, player);
      socket.emit('nickname', nickname);
      socket.emit('question', game.getCurrentQuestion());
      emitGameState(room);
    });

    socket.on('createGame', (quiz, options) => {
      let roomID = nanoid();
      while (manager.getGameById(roomID)) {
        roomID = nanoid();
      }
      const newGame = new Room(socket.id, quiz, roomID, options);
      manager.addGame(roomID, newGame);
      const { shuffleQuestions, shuffleAnswers } = options;
      if (shuffleQuestions) newGame.shuffleQuestions();
      if (shuffleAnswers) newGame.shuffleAnswers();
      socket.join(roomID);
      socket.room = roomID;
      emitGameState(roomID);
    });

    socket.on('startGame', () => {
      const room = socket.room;
      const game = manager.getGameById(room);
      game.state = 'QUESTION';
      io.to(room).emit('question', game.getCurrentQuestion());
      emitGameState(room);
      emitTimer(room, game.getCurrentQuestion().timer);
      let timer;
      const onQuestionEnd = () => {
        clearInterval(timer);
        // check room still exists (i.e. host tab still open)
        if (!manager.getGameById(room)) return;
        // if exists, move on to next question
        game.nextQuestion();
        if (game.isOver) {
          game.state = 'GAMEOVER';
          emitGameState(room);
          return manager.incrementDbStats(game);
        }
        emitTimer(room, game.getCurrentQuestion().timer);
        io.to(room).emit('question', game.getCurrentQuestion());
        emitGameState(room);
        timer = setInterval(onQuestionEnd, game.getCurrentQuestion().timer * 1000);
      }
      timer = setInterval(onQuestionEnd, game.getCurrentQuestion().timer * 1000);
    });

    socket.on('answer', (answer, callback) => {
      const room = socket.room;
      const game = manager.getGameById(room);
      const player = game.getPlayerBySocket(socket);
      if (player.hasAnswered) return;
      const answers = game.getCurrentAnswers();
      const question = game.getCurrentQuestion();
      const { options: { streakMultiplier } } = game;
      const isCorrect = !answers.length || answers.includes(answer);
      if (isCorrect) {
        player.setCorrect(streakMultiplier && player.streak ? question.points * player.streak : question.points);
        callback(true);
      } else {
        player.setIncorrect();
        callback(false);
      }
      question.answers = answers;
      player.addAnswer({ question, answer, isCorrect });
      game.numAnswered += 1;
      emitGameState(room);
    });

    socket.on('kickPlayer', (socketId) => {
      const room = socket.room;
      const game = manager.getGameById(room);
      // was it sent by the game host?
      if (game.host !== socket.id) return;
      const player = io.sockets.connected[socketId];
      if (!player) return;
      player.leave(room);
      game.removePlayer(player);
      emitGameState(room);
      player.emit('forceDisconnect', 'You were removed by the game host!');
    });

    socket.on('disconnect', () => {
      const room = socket.room;
      const game = manager.getGameById(room);
      // if room deleted by host, no need to manually remove player.
      if (!game) return;
      // if host disconnects, destroy room object
      if (game.host === socket.id) {
        manager.removeGame(room);
        // emit disconnect event to all players in room to inform them
        return io.to(room).emit('forceDisconnect', 'Host ended the game');
      }
      game.removePlayer(socket);
      emitGameState(room);
    });
  });
}

module.exports = init;
