const mongoose = require('mongoose');


// Create Schema
const bookSchema = new mongoose.Schema({
  title: String,
  isbn: Number,
  pageCount: Number,
  publishedDate: Date,
  thumbnailUrl: String,
  shorDescription: String,
  longDescription: String,
  status: String,
  authors: [String],
  categories: [String],
});

// Create model using Schema
const Book = mongoose.model('Book', bookSchema);

//export model
module.exports = Book;
