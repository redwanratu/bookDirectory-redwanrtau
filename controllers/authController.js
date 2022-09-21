const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const sendMail = require('../utils/email');
const { promisify } = require('util');
const crypto = require('crypto');
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
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('No user on this token'), 404);
  }
  // CHeck if user changed password  after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password has been changed !! Log in again!!'));
  }

  //GRANT ACCESS
  req.user = currentUser;
  next();
});

// restrictTo middlewere

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(req.user);
      return next(new AppError(`Access denied for ${req.user.role} role`, 404));
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1. get user based on posted mail
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No user found on this email address', 404));
  }
  // 2. generate random token
  // using instance method in models
  // using crypto
  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false });
  // 3. Actually send the e-mail
  // using nodemailer package
  // mailtrap account is needed

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;
  //console.log(resetToken);

  const message = `Forget your password?? Submit a PATCH request with your new password and posswordConfirm to : ${resetURL}\n If you didn't forget your password, Please ignore this massage`;

  // use try catch
  // if error occure reset the token and expire data at database to  reset
  try {
    await sendMail({
      email: user.email,
      subject: 'Password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      message: `Password Reset Token send to ${user.email}`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passResetTokenExpiresTime = undefined;
    user.save({ validateBeforeSave: false });

    res.status(404).json({
      err,
    });
    //return next(new AppError('ERROR occurs, Try again Later'), 500);
  }

  //***********this will be deleted next*********

  console.log('FORGET PASSWORD');
  //********************************************* */
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the reset token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passResetTokenExpiresTime: { $gt: Date.now() },
  });
  // 2. if password reset has not expired, reset password
  if (!user) {
    return next(new AppError('Token is invalid or Expired'), 404);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passResetTokenExpiresTime = undefined;
  await user.save();

  // 3. change passwordChangedAt property at User MODEL
  // 4. log in user and send JWT

  const token = signToken(user.id);

  res.status(201).json({
    status: 'success',
    token,
  });

  console.log('RESET PASSWORD');
});
