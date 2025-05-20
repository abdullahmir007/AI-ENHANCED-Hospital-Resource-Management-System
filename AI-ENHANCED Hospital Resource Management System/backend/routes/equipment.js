// File: routes/equipment.js
const express = require('express');
const { 
  getAllEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentStats,
  updateUsageStatus,
  addMaintenanceRecord,
  getScheduledMaintenance,
  uploadEquipmentData
} = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/auth');
const { check } = require('express-validator');
const validate = require('../middleware/validate');
const multer = require('multer');

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    // Accept Excel files only
    if (
      file.mimetype === 'application/vnd.ms-excel' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return cb(null, true);
    }
    cb(new Error('Only Excel files are allowed'));
  }
});

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Validation arrays
const equipmentValidation = [
  check('equipmentId', 'Equipment ID is required').not().isEmpty(),
  check('name', 'Name is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty(),
  check('manufacturer', 'Manufacturer is required').not().isEmpty(),
  check('model', 'Model is required').not().isEmpty(),
  check('serialNumber', 'Serial number is required').not().isEmpty(),
  check('purchaseDate', 'Purchase date is required').not().isEmpty(),
  check('location.ward', 'Ward is required').not().isEmpty(),
  check('location.room', 'Room is required').not().isEmpty()
];

const statusValidation = [
  check('status', 'Status is required').not().isEmpty()
];

const maintenanceValidation = [
  check('type', 'Maintenance type is required').not().isEmpty(),
  check('technician', 'Technician name is required').not().isEmpty()
];

// Routes
router.route('/')
  .get(getAllEquipment)
  .post(authorize('admin', 'manager', 'technician'), validate(equipmentValidation), createEquipment);

router.route('/stats')
  .get(getEquipmentStats);

router.route('/maintenance')
  .get(getScheduledMaintenance);

// Excel Upload Route
router.route('/upload')
  .post(
    authorize('admin', 'manager'),
    upload.single('file'),
    uploadEquipmentData
  );

router.route('/:id')
  .get(getEquipment)
  .put(authorize('admin', 'manager', 'technician'), updateEquipment)
  .delete(authorize('admin', 'manager'), deleteEquipment);

router.route('/:id/usage')
  .put(validate(statusValidation), updateUsageStatus);

router.route('/:id/maintenance')
  .post(validate(maintenanceValidation), addMaintenanceRecord);

module.exports = router;