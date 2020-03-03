const { model, Schema } = require('mongoose');

const QUESTION_TYPES = ['qna', 'multiple', 'wordcloud'];

const questionSchema = new Schema({
  type: {
    type: String,
    enum: QUESTION_TYPES
  },
  text: {
    type: String,
    trim: true,
    required: true
  },
  choices: {
    type: [String],
    trim: true
  },
  correct_answers: {
    type: [String],
    trim: true
  },
  points: {
    type: Number,
    default: 0
  },
  timer: {
    type: Number,
    default: 0
  }
});

module.exports = model('Question', questionSchema);