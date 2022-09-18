const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//create schema

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide us your email '],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid a valid email'],
  },
  photo: String,

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'passords are not same . Please confirm password.',
    },
  },
  passwordChangedAt: Date,
});

// hashing password
//pre save manupilating data before saving data to database
userSchema.pre('save', async function (next) {
  // only work creating new user
  // not during modified the document
  if (!this.isModified('password')) return next();

  // hashing the password with cost 12
  // hashing function has another sync version
  // but here it it the async version
  this.password = await bcrypt.hash(this.password, 12);

  //delete the confirm password
  //only needs when sign up
  this.passwordConfirm = undefined;
});

// user password checking
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check if password changes after token issued

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimeStamp > JWTTimeStamp;
  }
  return false;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
