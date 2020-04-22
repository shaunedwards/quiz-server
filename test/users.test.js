const { expect } = require('chai');
const request = require('supertest');

const app = require('../app');
const getCookie = require('./setup');
const games = require('./fixtures/games');

describe('Users tests', () => {
  describe('GET /users/games for authenticated user', () => {
    it('should respond with json containing a list of games created by user', (done) => {
      request(app)
        .get('/users/games')
        .set('cookie', getCookie())
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          expect(response.body).to.be.an('array');
          expect(response.body).to.have.lengthOf(1);
          done();
        });
    });
  });

  describe('POST /users/favourites for authenticated user', () => {
    it('should return 200 status if adding favourite was successful', (done) => {
      request(app)
        .post('/users/favourites')
        .set('cookie', getCookie())
        .query({ qid: games[0]._id.toString() })
        .expect(200, done);
    });
  });

  describe('GET /users/favourites for authenticated user', () => {
    it('should respond with json containing a list of games favourited by user', (done) => {
      request(app)
        .get('/users/favourites')
        .set('cookie', getCookie())
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          expect(response.body).to.be.an('array');
          expect(response.body).to.have.lengthOf(1);
          expect(response.body[0].title).to.equal(games[0].title);
          done();
        });
    });
  });

  describe('DELETE /users/favourites for authenticated user', () => {
    it('should return 200 status if removing favourite was successful', (done) => {
      request(app)
        .delete('/users/favourites')
        .set('cookie', getCookie())
        .query({ qid: games[0]._id.toString() })
        .expect(200, done);
    });
  });

  describe('GET /users/games while not logged in', () => {
    it('should return a 401 response', (done) => {
      request(app)
        .get('/users/games')
        .set('Accept', 'application/json')
        .expect(401, done);
    });
  });

  describe('GET /users/favourites while not logged in', () => {
    it('should return a 401 response', (done) => {
      request(app)
        .get('/users/favourites')
        .set('Accept', 'application/json')
        .expect(401, done);
    });
  });

  describe('POST /users/favourites while not logged in', () => {
    it('should return a 401 response', (done) => {
      request(app)
        .post('/users/favourites')
        .query({ qid: games[0]._id.toString() })
        .expect(401, done);
    });
  });

  describe('DELETE /users/favourites while not logged in', () => {
    it('should return a 401 response', (done) => {
      request(app)
        .delete('/users/favourites')
        .query({ qid: games[0]._id.toString() })
        .expect(401, done);
    });
  });
});
