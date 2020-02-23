const { model, Schema } = require('mongoose');

require('./user');
require('./subject');
require('./question');

const gameSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: 'Game name cannot be empty',
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
  subjects: [{
    type: 'ObjectId',
    ref: 'Subject'
  }],
  questions: [{
    type: 'ObjectId',
    ref: 'Question'
  }],
  draft: {
    type: Boolean,
    default: true
  }
});

gameSchema.path('subjects').validate(arr => arr && arr.length > 0, 'You must select at least one subject');

module.exports = model('Game', gameSchema);