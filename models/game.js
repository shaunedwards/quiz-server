const { model, Schema } = require('mongoose');

require('./user');
require('./subject');

const gameSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true
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
  questions: [require('./question').schema],
  draft: {
    type: Boolean,
    default: true
  },
  stats: {
    total_hosted: {
      type: Number,
      default: 0
    },
    total_correct: {
      type: Number,
      default: 0
    },
    total_questions: {
      type: Number,
      default: 0
    },
    total_players: {
      type: Number,
      default: 0
    }
  }
});

module.exports = model('Game', gameSchema);