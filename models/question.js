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
    required: [true, 'You must provide text for the question'],
    maxlength: [80, 'Question text must not exceed 80 characters']
  },
  choices: {
    type: [{
      type: String,
      trim: true,
      maxlength: [50, 'Choice text must not exceed 50 characters']
    }],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length >= 2
      },
      message: 'You must provide at least two answer choices'
    }
  },
  answers: {
    type: [{
      type: String,
      trim: true,
      maxlength: [50, 'Answer text must not exceed 50 characters']
    }],
    required: true
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
