// File: routes/dashboard.js
const express = require('express');
const { 
  getDashboardStats,
  getDashboardAlerts,
  getDashboardAIInsights
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router.get('/stats', getDashboardStats);
router.get('/alerts', getDashboardAlerts);
router.get('/ai-insights', getDashboardAIInsights);

module.exports = router;