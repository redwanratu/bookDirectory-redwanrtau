const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { promisify } = require('util');
//authentication should not be hamdled simply
//Users data is stake here
// Payload Id, JWT secret , Expires time
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
// sing up controller

exports.signup = catchAsync(async (req, res, next) => {
  // ITs better to use only data we need to store for sign up
  //  const newUser = await User.create(req.body);

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  // collecting token
  // Payload Id, JWT secret , Expires time
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

// log in controller

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email & password exist
  if (!email || !password) {
    return next(new AppError('Please Provide Email & Password  ', 404));
  }

  // 2. Check if user exist && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password'));
  }

  // 3. If everythinks okay, sent token to client'
  const token = signToken(user.id);
  res.status(201).json({
    status: 'success',
    token,
  });
});

// new middlewere function

exports.protect = catchAsync(async (req, res, next) => {
  //1. Getting token & check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log(token);
  }

  if (!token) {
    return next(
      new AppError(
        'YOu are not logged in! Please log in first to get access',
        404
      )
    );
  }
  //2. Varification Token
  // deceode recieved token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3. Check if user still exits
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('No user on this token'), 404);
  }
  // CHeck if user changed password  after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password has been changed !! Log in again!!'));
  }

  //GRANT ACCESS
  req.user = freshUser;
  next();
});
