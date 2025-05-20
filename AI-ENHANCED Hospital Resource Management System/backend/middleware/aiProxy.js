// File: middleware/aiProxy.js
const axios = require('axios');
const config = require('../config/config');

// Get AI service URL from config or use default
const aiServiceUrl = process.env.AI_SERVICE_URL || config.aiServiceUrl || 'http://localhost:5001';

/**
 * Middleware to proxy AI-related requests to the Flask AI service
 */
const aiProxy = async (req, res, next) => {
  // Only proxy requests to specific AI paths
  if (!req.path.startsWith('/api/ai-insights')) {
    return next();
  }

  try {
    // Map Express routes to Flask routes
    let flaskEndpoint = '';
    let method = 'POST';
    let data = req.body || {};

    switch (req.path) {
      case '/api/ai-insights/resource-optimization':
        flaskEndpoint = '/api/resource-optimization';
        // Don't pass test data - let the AI service fetch from database
        data = { resourceType: 'all' };
        break;
      case '/api/ai-insights/disease-prediction':
        flaskEndpoint = '/api/disease-prediction';
        break;
      case '/api/ai-insights/anomalies':
        flaskEndpoint = '/api/anomaly-detection';
        break;
      default:
        // For other AI-insights endpoints, don't proxy
        return next();
    }

    console.log(`Proxying request to AI service: ${aiServiceUrl}${flaskEndpoint}`);

    // Forward the request to Flask service
    const response = await axios({
      method: method,
      url: `${aiServiceUrl}${flaskEndpoint}`,
      data: data,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log(`Received response from AI service for ${flaskEndpoint}`);
    
    // Return the Flask service response
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('AI Service proxy error:', error.message);
    
    // If Flask service is unreachable, fall back to original handler
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.log('AI Service unavailable, falling back to default implementation');
      return next();
    }
    
    // For other errors, send to error handler
    return next(error);
  }
};

module.exports = aiProxy;