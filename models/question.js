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
    required: 'Question text cannot be empty'
  },
  choices: {
    type: [String],
    trim: true,
    validate: {
      validator: arr => arr && arr.length > 0 && arr.length < 5,
      message: 'You must provide between 1 to 4 answers for your question'
    }
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