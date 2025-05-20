// File: routes/ai.js
const express = require('express');
const { 
  getAIInsights,
  getAIHealth,
  getResourceOptimization,
  applyRecommendation,
  getBedPrediction,
  getDiseaseOutbreakPrediction,
  getAnomalyDetection
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router.get('/', getAIInsights);
router.get('/health', getAIHealth);
router.get('/resource-optimization', getResourceOptimization);
router.get('/bed-prediction', getBedPrediction);
router.get('/disease-prediction', getDiseaseOutbreakPrediction);
router.get('/anomalies', getAnomalyDetection);
router.post('/apply-recommendation/:id', authorize('admin', 'manager'), applyRecommendation);

// Test route
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Service API is working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
