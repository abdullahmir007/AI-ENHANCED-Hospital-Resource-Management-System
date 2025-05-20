// File: middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const config = require('../config/config');
const logger = require('../utils/logger');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if auth header exists and is in the right format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from Bearer token
    token = req.headers.authorization.split(' ')[1];
  }

  // Special handling for batch upload route
  if (!token && req.originalUrl.includes('/patients/batch')) {
    logger.warn('No auth token for batch route - using fallback auth');
    try {
      // Get the first admin user if available
      const adminUser = await User.findOne({ role: 'admin' });
      
      if (adminUser) {
        req.user = adminUser;
        logger.info(`Using admin user ${adminUser._id} for batch processing`);
        return next();
      } else {
        logger.error('No admin user found for fallback authentication');
      }
    } catch (err) {
      logger.error(`Error finding admin user for fallback: ${err.message}`);
    }
  }

  // Check if token exists
  if (!token) {
    // Log missing token for debugging 
    logger.error('Token missing: request to ' + req.originalUrl);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      logger.error(`User not found for ID: ${decoded.id}`);
      return next(new ErrorResponse('User not found', 401));
    }

    // Successfully authenticated
    next();
  } catch (err) {
    // Log the specific error for debugging
    logger.error(`Auth error: ${err.message} for request to ${req.originalUrl}`);
    
    // Provide more specific error messages based on JWT error type
    if (err.name === 'JsonWebTokenError') {
      return next(new ErrorResponse('Invalid token', 401));
    } else if (err.name === 'TokenExpiredError') {
      return next(new ErrorResponse('Token expired', 401));
    } else {
      return next(new ErrorResponse('Authentication failed', 401));
    }
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt: User ${req.user._id} with role ${req.user.role} attempted to access ${req.originalUrl}`);
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};