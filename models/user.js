const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  uid: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true
  },
  full_name: {
    type: String,
    trim: true
  },
  favourites: [{
    type: 'ObjectId',
    ref: 'Game'
  }],
  last_login: {
    type: Date,
    default: Date.now
  }
});

module.exports = model('User', userSchema);