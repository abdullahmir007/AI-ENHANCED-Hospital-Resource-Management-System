// File: middleware/error.js
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  logger.error(`Error: ${err.message}`);
  if (err.stack) {
    logger.error(`Stack: ${err.stack}`);
  }

  // Check for "Cannot set property query" error
  if (err.message && err.message.includes('Cannot set property query')) {
    logger.error('Request query modification error detected');
    error = new ErrorResponse('Server error while processing request parameters', 500);
    
    // Return immediately to prevent further processing that might cause errors
    return res.status(500).json({
      success: false,
      error: 'Server error while processing request parameters'
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // CORS error handling
  if (err.message && err.message.includes('CORS')) {
    logger.error('CORS Policy Violation Error');
    error = new ErrorResponse('Cross-Origin Request Blocked - Check CORS configuration', 500);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('Invalid token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('Your token has expired. Please log in again.', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;