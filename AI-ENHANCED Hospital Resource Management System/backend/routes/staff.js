// File: routes/staff.js
const express = require('express');
const { 
  getAllStaff,
  getStaffMember,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  getStaffStats,
  getStaffSchedule,
  updateStaffSchedule,
  getStaffPerformance,
  getOptimalStaffing,
  getStaffUtilization,
  getStaffAvailability,
  recordOvertime
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');
const { check } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Validation arrays
const staffValidation = [
  check('staffId', 'Staff ID is required').not().isEmpty(),
  check('name', 'Name is required').not().isEmpty(),
  check('staffType', 'Staff type is required').not().isEmpty(),
  check('department', 'Department is required').not().isEmpty()
];

const scheduleValidation = [
  check('shifts', 'Shifts must be an array').isArray()
];

const overtimeValidation = [
  check('hours', 'Hours is required').not().isEmpty().isNumeric()
];

// Routes
router.route('/')
  .get(getAllStaff)
  .post(authorize('admin', 'manager'), validate(staffValidation), createStaffMember);

router.route('/stats')
  .get(getStaffStats);

router.route('/optimal')
  .get(getOptimalStaffing);

router.route('/utilization')
  .get(getStaffUtilization);

router.route('/availability')
  .get(getStaffAvailability);

router.route('/:id')
  .get(getStaffMember)
  .put(authorize('admin', 'manager'), updateStaffMember)
  .delete(authorize('admin', 'manager'), deleteStaffMember);

router.route('/:id/schedule')
  .get(getStaffSchedule)
  .put(validate(scheduleValidation), updateStaffSchedule);

router.route('/:id/performance')
  .get(getStaffPerformance);

router.route('/:id/overtime')
  .post(validate(overtimeValidation), recordOvertime);

module.exports = router;