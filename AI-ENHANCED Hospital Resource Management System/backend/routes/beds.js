// File: routes/beds.js
const express = require('express');
const { 
  getAllBeds,
  getBed,
  createBed,
  updateBed,
  deleteBed,
  getBedStats,
  assignBed,
  releaseBed,
  reserveBed,
  uploadBedExcel
} = require('../controllers/bedController');
const { protect, authorize } = require('../middleware/auth');
const { check } = require('express-validator');
const validate = require('../middleware/validate');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed (.xlsx, .xls)'), false);
    }
  }
});

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Validation arrays
const bedValidation = [
  check('bedId', 'Bed ID is required').not().isEmpty(),
  check('ward', 'Ward is required').not().isEmpty(),
  check('location.roomNumber', 'Room number is required').not().isEmpty()
];

const assignBedValidation = [
  check('patientId', 'Patient ID is required').not().isEmpty()
];

const reserveBedValidation = [
  check('name', 'Name is required for reservation').not().isEmpty()
];

// Routes
router.route('/')
  .get(getAllBeds)
  .post(authorize('admin', 'manager'), validate(bedValidation), createBed);

router.route('/stats')
  .get(getBedStats);

// Add the Excel upload route
router.route('/upload')
  .post(
    authorize('admin', 'manager'), 
    upload.single('bedFile'), 
    uploadBedExcel
  );

router.route('/:id')
  .get(getBed)
  .put(authorize('admin', 'manager', 'staff'), updateBed)
  .delete(authorize('admin', 'manager'), deleteBed);

router.route('/:id/assign')
  .put(validate(assignBedValidation), assignBed);

router.route('/:id/release')
  .put(releaseBed);

router.route('/:id/reserve')
  .put(validate(reserveBedValidation), reserveBed);

module.exports = router;