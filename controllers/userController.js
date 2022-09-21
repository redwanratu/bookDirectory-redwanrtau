const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('./../utils/catchAsync');

const filterObj = (obj, ...objFields) => {
  newObj = {};
  console.log(obj);
  Object.keys(obj).forEach((el) => {
    if (objFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: [users],
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Create an error if user POSTs password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updating'), 404);
  }
  // 2. Filter out unwanted field
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3. update fields
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { active: false },
    { new: true, runValidators: true }
  );

  res.status(201).json({
    status: 'success',
  });
});
