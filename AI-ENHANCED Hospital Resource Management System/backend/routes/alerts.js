// File: routes/alerts.js
const express = require('express');
const { 
  getAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  markAsRead,
  markAllAsRead,
  getAlertStats
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');
const { check } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Validation arrays
const alertValidation = [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty()
];

// Routes
router.route('/')
  .get(getAlerts)
  .post(validate(alertValidation), createAlert);

router.route('/stats')
  .get(getAlertStats);

router.route('/read-all')
  .put(markAllAsRead);

router.route('/:id')
  .get(getAlert)
  .put(updateAlert)
  .delete(authorize('admin', 'manager'), deleteAlert);

router.route('/:id/read')
  .put(markAsRead);

module.exports = router;