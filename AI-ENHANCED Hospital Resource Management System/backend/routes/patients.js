// File: routes/patients.js
const express = require('express');
const { 
  getAllPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats,
  addVitalSigns,
  addMedication,
  addNote,
  processBatchPatients
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');
const { check } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Validation arrays
const patientValidation = [
  check('patientId', 'Patient ID is required').not().isEmpty(),
  check('name', 'Name is required').not().isEmpty(),
  check('age', 'Age is required').isNumeric(),
  check('gender', 'Gender is required').not().isEmpty(),
  check('admissionDate', 'Admission date is required').not().isEmpty(),
  check('diagnosis', 'Diagnosis is required').not().isEmpty()
];

const vitalsValidation = [
  check('temperature', 'Temperature is required').optional().isNumeric(),
  check('heartRate', 'Heart rate is required').optional().isNumeric(),
  check('respiratoryRate', 'Respiratory rate is required').optional().isNumeric(),
  check('oxygenSaturation', 'Oxygen saturation is required').optional().isNumeric()
];

const medicationValidation = [
  check('name', 'Medication name is required').not().isEmpty(),
  check('dosage', 'Dosage is required').not().isEmpty(),
  check('frequency', 'Frequency is required').not().isEmpty()
];

const noteValidation = [
  check('text', 'Note text is required').not().isEmpty()
];

// Routes
router.route('/')
  .get(getAllPatients)
  .post(validate(patientValidation), createPatient);

router.route('/stats')
  .get(getPatientStats);

// Batch processing route - NO validation middleware
router.route('/batch')
  .post(processBatchPatients);

router.route('/:id')
  .get(getPatient)
  .put(updatePatient)
  .delete(authorize('admin', 'doctor', 'manager'), deletePatient);

router.route('/:id/vitals')
  .post(validate(vitalsValidation), addVitalSigns);

router.route('/:id/medications')
  .post(validate(medicationValidation), addMedication);

router.route('/:id/notes')
  .post(validate(noteValidation), addNote);

module.exports = router;