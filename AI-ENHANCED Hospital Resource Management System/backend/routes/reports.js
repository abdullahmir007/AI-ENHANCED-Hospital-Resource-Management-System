// File: routes/reports.js
const express = require('express');
const { 
  getOperationalReports,
  getBedOccupancyReport,
  getStaffUtilizationReport,
  getEquipmentUsageReport,
  getDepartmentPerformanceReport,
  exportReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Test endpoint that doesn't require DB access
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Reports API is working'
  });
});

// Define routes
router.get('/operational', getOperationalReports);
router.get('/bed-occupancy', getBedOccupancyReport);
router.get('/staff-utilization', getStaffUtilizationReport);
router.get('/equipment-usage', getEquipmentUsageReport);
router.get('/department-performance', getDepartmentPerformanceReport);
router.get('/export/:reportType', exportReport);

module.exports = router;