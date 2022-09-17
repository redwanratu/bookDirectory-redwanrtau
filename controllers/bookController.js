const defaultError = require('../utils/AppError');
const ApiFeatures = require('./../utils/apiFeatures');
const Book = require('./../models/bookModel');
const catchAsync = require('./../utils/catchAsync');
const express = require('express');
const AppError = require('../utils/AppError');

//use middleware to read json inputs
//use async function
//try catch
////

exports.getAllBooks = catchAsync(async (req, res,next) => {
  let result = await Book.find().countDocuments();

  const features = new ApiFeatures(Book.find(), req.query, result)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const books = await features.query;
  result = await features.query.countDocuments();

  console.log(result);
  res.status(200).json({
    status: 'success',
    result,

    data: {
      books,
    },
  });
});

exports.createBook = catchAsync(async (req, res,next) => {
  const newBook = await Book.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      book: newBook,
    },
  });
});

exports.getBook = catchAsync(async (req, res,next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new AppError('No book found on this ID', 404));
  }
  console.log('books by id');
  console.log(req.params.id);
  res.status(200).json({
    status: 'success',

    data: { book },
  });
});

exports.updateBook = catchAsync(async (req, res,next) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!book) {
    return next(new AppError('No book found on this ID', 404));
  }

  console.log('updated successfullly');
  res.status(200).json({
    status: 'success',
    message: 'updated successfullly',
    data: book,
  });
});

exports.deleteBook = catchAsync(async (req, res,next) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    return next(new AppError('No book found on this ID', 404));
  }

  console.log('deletion done');
  res.status(204).json({
    status: 'success',
  });
});
