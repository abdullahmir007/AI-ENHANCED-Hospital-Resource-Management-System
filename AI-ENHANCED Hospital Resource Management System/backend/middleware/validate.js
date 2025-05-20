// File: middleware/validate.js
const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check if there are validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return next(new ErrorResponse(errorMessages, 400));
    }

    next();
  };
};

module.exports = validate;