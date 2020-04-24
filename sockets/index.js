const socketIO = require('socket.io');
const generateName = require('sillyname');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 6);

const Room = require('./room');
const Player = require('./player');
const Game = require('../models/game');

const games = {};

async function init(server) {
  if (process.env.NODE_ENV === 'test') return;
  const io = socketIO(server);

  const emitGameState = (room) => io.to(room).emit('gamestate', games[room].toJSON());

  const emitTimer = (room, timer) => {
    io.to(room).emit('timer', timer);
    let timeRemaining = setInterval(() => {
      if (timer === 1) return clearInterval(timeRemaining);
      io.to(room).emit('timer', --timer);
    }, 1000);
  }

  const incrementDbStats = (game) => {
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

  io.on('connection', (socket) => {
    console.log('PLAYER JOINED', socket.id);

    socket.on('room', (room) => {
      socket.join(room);
      socket.room = room;
    });

    socket.on('playerJoin', (room, callback) => {
      if (!games[room]) return callback(false);
      socket.join(room);
      socket.room = room;
      const nickname = generateName();
      const player = new Player(nickname);
      games[room].addPlayer(socket, player);
      socket.emit('nickname', nickname);
      socket.emit('question', games[room].getCurrentQuestion());
      emitGameState(room);
    });

    socket.on('createGame', (quiz, options) => {
      let roomID = nanoid();
      while (games[roomID]) {
        roomID = nanoid();
        console.log('duplicate', roomID);
      }
      games[roomID] = new Room(socket.id, quiz, roomID, options);
      const { shuffleQuestions, shuffleAnswers } = options;
      if (shuffleQuestions) games[roomID].shuffleQuestions();
      if (shuffleAnswers) games[roomID].shuffleAnswers();
      console.log('new game created', games[roomID]);
      socket.join(roomID);
      socket.room = roomID;
      emitGameState(roomID);
    });

    socket.on('startGame', () => {
      const room = socket.room;
      if (!room) return;
      const game = games[room];
      game.state = 'QUESTION';
      // socket.emit('question', game.getCurrentQuestion());
      io.to(room).emit('question', game.getCurrentQuestion());
      emitGameState(room);
      emitTimer(room, game.getCurrentQuestion().timer);
      let timer = setInterval(() => {
        // if game no longer exists (e.g. host closed tab), clear timer to prevent further events being emitted
        if (!games[room]) return clearInterval(timer);
        if (game.isOver) {
          game.state = 'GAMEOVER';
          emitGameState(room);
          clearInterval(timer);
          return incrementDbStats(game);
        }
        game.nextQuestion();
        emitTimer(room, game.getCurrentQuestion().timer);
        io.to(room).emit('question', game.getCurrentQuestion());
        emitGameState(room);
      }, game.getCurrentQuestion().timer * 1000);
    });

    socket.on('nickname', (nick) => {
      const room = socket.room;
      if (!room) return;
      const player = new Player(nick);
      games[room].addPlayer(socket, player);
      emitGameState(room);
      socket.emit('question', games[room].getCurrentQuestion());
      // TODO: emit timer to socket only to prevent initial delay
    });

    socket.on('answer', (answer, callback) => {
      const room = socket.room;
      if (!room) return;
      const player = games[room].getPlayerBySocket(socket);
      const answers = games[room].getCurrentAnswers();
      const question = games[room].getCurrentQuestion();
      const { streakMultiplier } = games[room].options;
      const isCorrect = !answers.length || answers.includes(answer);
      if (isCorrect) {
        player.setCorrect(streakMultiplier && player.streak ? question.points * player.streak : question.points);
        callback(true);
      } else {
        player.setIncorrect();
        callback(false);
      }
      question.correct_answers = answers;
      player.addAnswer({ question, answer, isCorrect });
      // TODO: if no answer, reset streak
      games[room].numAnswered += 1;
      emitGameState(room);
    });

    socket.on('kickPlayer', (socketId) => {
      const room = socket.room;
      // was it sent by the game host?
      if (games[room].host !== socket.id) return;
      const player = io.sockets.connected[socketId];
      if (!player) return;
      player.leave(room);
      games[room].removePlayer(player);
      emitGameState(room);
      player.emit('forceDisconnect', 'You were removed by the game host!');
    });

    socket.on('feedback', (rating) => {
      // TODO: store feedback in db
      console.log('feedback received', rating);
      const player = games[socket.room].getPlayerBySocket(socket);
      player.feedback = true;
    });

    socket.on('getFeedback', (callback) => {
      const player = games[socket.room].getPlayerBySocket(socket);
      callback(player.feedback);
    });

    socket.on('disconnect', () => {
      const room = socket.room;
      if (!room) return;
      // if room deleted by host, no need to manually remove player.
      if (!games[room]) return;
      // if host disconnects, destroy room object
      if (games[room].host === socket.id) {
        games[room] = undefined;
        // emit disconnect event to all players in room to inform them
        return io.to(room).emit('forceDisconnect', 'Host ended the game');
      }
      games[room].removePlayer(socket);
      emitGameState(room);
    });
  });
}

module.exports = init;
module.exports.games = games;
