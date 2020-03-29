const mongoose = require('mongoose');

let dbUrl = process.env.MONGO_URI;

if (process.env.NODE_ENV === 'test') {
  dbUrl = process.env.TEST_MONGO_URI;
}

const db = mongoose.connect(dbUrl, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

module.exports = db;
