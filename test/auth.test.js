const { expect } = require('chai');
const request = require('supertest');

const app = require('../app');
const getCookie = require('./setup');

describe('Authentication tests', () => {
  describe('POST /register with unique username and valid password', () => {
    it('should return a 201 response with user object', (done) => {
      request(app)
        .post('/register')
        .set('Accept', 'application/json')
        .send({ username: 'test', password: 'testing123' })
        .expect('Content-Type', /json/)
        .expect(201)
        .then(response => {
          expect(response.body).to.be.an('object');
          expect(response.body.uid).to.equal('test');
          expect(response.body).to.have.property('_id');
          done();
        });
    });
  });

  describe('POST /register with an existing username', () => {
    it('should return a 400 response with appropriate error message', (done) => {
      request(app)
      .post('/register')
      .set('Accept', 'application/json')
      .send({ username: 'test', password: 'testing123' })
      .expect('Content-Type', /json/)
      .expect(400)
      .then(response => {
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.equal('This username is already in use. Please choose another.');
        done();
      });
    });
  });

  describe('POST /auth/local with invalid credentials', () => {
    it('should return a 401 response', (done) => {
      request(app)
        .post('/auth/local')
        .set('Accept', 'application/json')
        .send({ username: 'test', password: 'wrongpass' })
        .expect(401, done);
    });
  });

  describe('GET /session without being logged in', () => {
    it('should return a 401 response', (done) => {
      request(app)
        .get('/session')
        .set('Accept', 'application/json')
        .expect(401, done);
    });
  });

  describe('POST /auth/local with valid credentials', () => {
    it('should return a 200 response with user object', (done) => {
      request(app)
        .post('/auth/local')
        .set('Accept', 'application/json')
        .send({ username: 'test', password: 'testing123' })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          expect(response.body).to.be.an('object');
          expect(response.body).to.have.property('user');
          expect(response.body.user.uid).to.equal('test');
          done();
        });
    });
  });

  describe('GET /session for logged in user', () => {
    it('should return a 200 response with user session', (done) => {
      request(app)
        .get('/session')
        .set('cookie', getCookie())
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          expect(response.body).to.be.an('object');
          expect(response.body).to.have.property('sid');
          done();
        });
    });
  });
});
