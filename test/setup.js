const request = require('supertest');

const app = require('../app');
const User = require('../models/user');
const Game = require('../models/game');
const Subject = require('../models/subject');
const { users, games, subjects } = require('./fixtures');

let cookie;

before(async () => {
  await User.collection.drop();
  await Game.collection.drop();
  await Subject.collection.drop();
  await User.collection.insertMany(users);
  await Game.collection.insertMany(games);
  await Subject.collection.insertMany(subjects);
  await request(app)
    .post('/auth/local')
    .send({ username: 'test_user', password: 'testing123' })
    .then(response => {
      // store session cookie for authenticated routes
      cookie = response.headers['set-cookie'].pop().split(';')[0];
    });
});

module.exports = () => {
  return cookie;
}
