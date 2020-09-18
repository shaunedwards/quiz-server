const bcrypt = require('bcryptjs');
const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  uid: {
    type: String,
    trim: true,
    required: [true, 'Username is required'],
    minlength: [3, 'Usernames must be between 3 and 15 characters'],
    maxlength: [15, 'Usernames must be between 3 and 15 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_]*$/.test(v)
      },
      message: 'Usernames can only contain alphanumeric characters'
    }
  },
  password: {
    type: String,
    minlength: [8, 'Passwords must be at least 8 characters']
  },
  email: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  favourites: [{
    type: 'ObjectId',
    ref: 'Game'
  }],
  last_login: {
    type: Date
  }
});

userSchema.pre('save', function(next) {
  if (!this.password || !this.isModified('password')) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});

userSchema.methods.verifyPassword = function(data) {
  return bcrypt.compareSync(data, this.password);
}

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
