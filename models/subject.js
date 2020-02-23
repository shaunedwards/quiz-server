const { model, Schema } = require('mongoose');

const subjectSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  background_image: {
    type: String,
    required: true
  }
});

module.exports = model('Subject', subjectSchema);