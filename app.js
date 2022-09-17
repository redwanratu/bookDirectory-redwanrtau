const express = require('express');
const AppError = require('./utils/AppError');
const bookRoutes = require('./routes/bookRoutes');
const globalErrorHandler = require('./controllers/errorController');
// Middlewares

app = express();
app.use(express.json());

app.use('/api/v1/books', bookRoutes);

// operational url not found error

app.all('*', (req, res, next) => {
  const err = new AppError(`${req.originalUrl} not found in the server`, 404);
  next(err);
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
