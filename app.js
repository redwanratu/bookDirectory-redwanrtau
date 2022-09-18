const express = require('express');
const AppError = require('./utils/AppError');
const bookRoutes = require('./routes/bookRoutes');
const globalErrorHandler = require('./controllers/errorController');
const userRoutes = require('./routes/userRoutes');

// Middlewares

app = express();
app.use(express.json());

app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/users', userRoutes);
// operational url not found error

app.all('*', (req, res, next) => {
  const err = new AppError(`${req.originalUrl} not found in the server`, 404);
  next(err);
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
