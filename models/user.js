const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  uid: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    trim: true,
    required: true
  },
  name: {
    type: String,
    trim: true,
    required: true
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

userSchema.methods.favourite = function(id) {
  if (this.favourites.includes(id)) return;
  this.favourites.push(id);
  return this.save();
}

userSchema.methods.unfavourite = function(id) {
  const index = this.favourites.indexOf(id);
  if (index !== -1) {
    this.favourites.splice(index, 1);
    return this.save();
  }
  return false;
}

module.exports = model('User', userSchema);