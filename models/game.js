const { model, Schema } = require('mongoose');

require('./user');
require('./subject');
require('./question');

const gameSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: 'Quiz title cannot be empty',
  },
  desc: {
    type: String,
    trim: true
  },
  created_by: {
    type: 'ObjectId',
    ref: 'User',
    required: true
  },
  public: {
    type: Boolean,
    default: true
  },
  subject: {
    type: 'ObjectId',
    ref: 'Subject',
    required: true
  },
  questions: [{
    type: 'ObjectId',
    ref: 'Question'
  }],
  draft: {
    type: Boolean,
    default: true
  }
});

module.exports = model('Game', gameSchema);