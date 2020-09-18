const { expect } = require('chai');
const request = require('supertest');

const app = require('../app');
const getCookie = require('./setup');
const games = require('./fixtures/games');
const subjects = require('./fixtures/subjects');

const game = {
  title: 'test quiz',
  subject: subjects[0]._id,
  draft: false,
  public: true,
  questions: [
    {
      type: 'multiple',
      text: 'test question',
      choices: ['true', 'false'],
      answers: ['true'],
      points: 500,
      timer: 30
    }
  ]
};

const updatedGame = {
  ...game,
  title: 'updated title'
};

let gameId;

describe('Games tests', () => {
  describe('GET /games', () => {
    it('should respond with json containing a list of all games', (done) => {
      request(app)
        .get('/games')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          expect(response.body).to.be.an('array');
          expect(response.body).to.have.lengthOf(games.length);
          done();
        });
    });
  });

  describe('GET /games/:id', () => {
    it('should respond with json containing a single game', (done) => {
      request(app)
        .get(`/games/${games[0]._id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          expect(response.body).to.be.an('object');
          expect(response.body.title).to.equal(games[0].title);
          done();
        });
    });
  });

  describe('GET /games/recent?limit=1', () => {
    it('should respond with the single most recently published game', (done) => {
      request(app)
        .get('/games/recent?limit=1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          expect(response.body).to.be.an('array');
          expect(response.body).to.have.length(1);
          expect(response.body[0].title).to.equal(games[1].title);
          done();
        });
    });
  });

  describe('POST /games while logged in', () => {
    it('should return a 201 status with newly created game', (done) => {
      request(app)
        .post('/games')
        .set('cookie', getCookie())
        .send(game)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(response => {
          gameId = response.body._id;
          expect(response.body).to.be.an('object');
          expect(response.body).to.have.property('_id');
          expect(response.body.title).to.equal(game.title);
          expect(response.body.questions).to.have.lengthOf(game.questions.length);
          done();
        });
    });
  });

  describe('POST /games while not logged in', () => {
    it('should return a 401 status', (done) => {
      request(app)
        .post('/games')
        .send(game)
        .set('Accept', 'application/json')
        .expect(401, done)
    });
  });

  describe('PUT /games/:id with authorisation', () => {
    it('should modify existing game and return updated document', (done) => {
      request(app)
        .put(`/games/${gameId}`)
        .set('cookie', getCookie())
        .send(updatedGame)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          expect(response.body).to.be.an('object');
          expect(response.body.title).to.equal(updatedGame.title);
          done();
        });
    });
  });
  
  describe('PUT /games/:id without being authorised', () => {
    it('should return a 403 status', (done) => {
      request(app)
        .post('/auth/local')
        .send({ username: 'some_other_user', password: 'testing123' })
        .then(response => {
          const cookie = response.headers['set-cookie'].pop().split(';')[0];
          request(app)
            .put(`/games/${gameId}`)
            .set('cookie', cookie)
            .send(updatedGame)
            .expect(403, done);
        });
    });
  });
  
  describe('PUT /games/:id without being authenticated', () => {
    it('should return a 401 status', (done) => {
      request(app)
        .put(`/games/${gameId}`)
        .send(updatedGame)
        .expect(401, done);
    });
  });

  
  describe('DELETE /games/:id without being authorised', () => {
    it('should return a 403 status', (done) => {
      request(app)
        .post('/auth/local')
        .send({ username: 'some_other_user', password: 'testing123' })
        .then(response => {
          const cookie = response.headers['set-cookie'].pop().split(';')[0];
          request(app)
            .delete(`/games/${gameId}`)
            .set('cookie', cookie)
            .expect(403, done);
        });
    });
  });
  
  describe('DELETE /games/:id without being authenticated', () => {
    it('should return a 401 status', (done) => {
      request(app)
        .delete(`/games/${gameId}`)
        .expect(401, done);
    });
  });

  describe('DELETE /games/:id with authorisation', () => {
    it('should delete the game and return a 204 status', (done) => {
      request(app)
        .delete(`/games/${gameId}`)
        .set('cookie', getCookie())
        .expect(204, done);
    });
  });
});
