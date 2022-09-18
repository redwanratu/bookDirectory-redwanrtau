const express = require('express');
const bookController = require('../controllers/bookController.js');
const authController  = require('./../controllers/authController' );
const router = express.Router();

//Routes

// 1) Basic CRUD API route
router
  .route('/')
  .get(authController.protect ,bookController.getAllBooks)
  .post(bookController.createBook);
router
  .route('/:id')
  .get(bookController.getBook)
  .patch(bookController.updateBook)
  .delete(bookController.deleteBook);

module.exports = router;
