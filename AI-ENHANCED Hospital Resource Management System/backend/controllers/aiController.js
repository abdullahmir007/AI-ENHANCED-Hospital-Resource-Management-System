// File: controllers/aiController.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const aiService = require('../services/aiServiceIntegration');

// @desc    Get AI insights overview
// @route   GET /api/ai-insights
// @access  Private
exports.getAIInsights = asyncHandler(async (req, res, next) => {
  const insights = await aiService.getAIInsights();
  
  res.status(200).json({
    success: true,
    data: insights
  });
});

// @desc    Get health status of AI service
// @route   GET /api/ai-insights/health
// @access  Private
exports.getAIHealth = asyncHandler(async (req, res, next) => {
  const health = await aiService.checkHealth();
  
  res.status(200).json({
    success: true,
    status: health ? 'healthy' : 'issues',
    timestamp: new Date().toISOString()
  });
});

// @desc    Get resource optimization recommendations
// @route   GET /api/ai-insights/resource-optimization
// @access  Private
exports.getResourceOptimization = asyncHandler(async (req, res, next) => {
  const data = await aiService.getResourceOptimization();
  
  res.status(200).json({
    success: true,
    data
  });
});

// @desc    Get disease outbreak prediction
// @route   GET /api/ai-insights/disease-prediction
// @access  Private
exports.getDiseaseOutbreakPrediction = asyncHandler(async (req, res, next) => {
  const data = await aiService.getDiseaseOutbreakPrediction();
  
  res.status(200).json({
    success: true,
    data
  });
});

// @desc    Get anomaly detection results
// @route   GET /api/ai-insights/anomalies
// @access  Private
exports.getAnomalyDetection = asyncHandler(async (req, res, next) => {
  const data = await aiService.getAnomalyDetection();
  
  res.status(200).json({
    success: true,
    data
  });
});

// @desc    Get bed utilization prediction
// @route   GET /api/ai-insights/bed-prediction
// @access  Private
exports.getBedPrediction = asyncHandler(async (req, res, next) => {
  const days = req.query.days ? parseInt(req.query.days) : 7;
  const data = await aiService.getBedPrediction(days);
  
  res.status(200).json({
    success: true,
    data
  });
});

// @desc    Apply AI recommendation
// @route   POST /api/ai-insights/apply-recommendation/:id
// @access  Private/Manager or Admin
exports.applyRecommendation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  // Record who applied the recommendation
  const appliedBy = req.user.id;
  
  const result = await aiService.applyRecommendation(id, appliedBy);
  
  res.status(200).json({
    success: true,
    data: result
  });
});