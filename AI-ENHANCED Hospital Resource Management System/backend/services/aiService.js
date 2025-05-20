// services/aiService.js
import API from './api';

// Use 127.0.0.1 explicitly
const AI_SERVICE_URL = 'http://127.0.0.1:5001';

// Separate API instance for AI service requests
const AI_API = {
  get: async (endpoint) => {
    try {
      console.log(`GET ${AI_SERVICE_URL}${endpoint}`);
      const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`API error: ${response.status} - ${response.statusText}`);
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in GET ${endpoint}:`, error);
      throw error;
    }
  },
  
  post: async (endpoint, data) => {
    try {
      console.log(`POST ${AI_SERVICE_URL}${endpoint}`, data);
      const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        console.error(`API error: ${response.status} - ${response.statusText}`);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in POST ${endpoint}:`, error);
      throw error;
    }
  }
};

/**
 * Check the health status of the AI service
 */
export const checkAIServiceHealth = async () => {
  try {
    return await AI_API.get('/health');
  } catch (error) {
    console.error('AI service health check failed:', error);
    return { status: 'offline' };
  }
};

/**
 * Get resource optimization data
 */
export const getResourceOptimization = async () => {
  try {
    // First load the test data
    const bedsResponse = await fetch('/test_data/beds.json');
    const staffResponse = await fetch('/test_data/staff.json');
    const equipmentResponse = await fetch('/test_data/equipment.json');
    
    if (!bedsResponse.ok || !staffResponse.ok || !equipmentResponse.ok) {
      throw new Error('Failed to load test data');
    }
    
    const bedsData = await bedsResponse.json();
    const staffData = await staffResponse.json();
    const equipmentData = await equipmentResponse.json();
    
    console.log("Test data loaded successfully:");
    console.log("Beds data:", bedsData.length, "items");
    console.log("Staff data:", staffData.length, "items");
    console.log("Equipment data:", equipmentData.length, "items");
    
    // Call the AI service
    return await AI_API.post('/api/resource-optimization', {
      bedsData,
      staffData,
      equipmentData,
      resourceType: 'all'
    });
  } catch (error) {
    console.error('Error getting resource optimization:', error);
    throw error;
  }
};

/**
 * Get AI dashboard data
 */
export const getAIDashboardData = async () => {
  try {
    // First check health
    const health = await checkAIServiceHealth();
    if (health.status !== 'healthy') {
      throw new Error('AI service is not available');
    }
    
    // Then get resource optimization data
    const resourceData = await getResourceOptimization();
    
    // Return the data
    return {
      resourceOptimization: resourceData
    };
  } catch (error) {
    console.error('Error fetching AI dashboard data:', error);
    throw error;
  }
};

// Other functions remain the same
export const getDiseaseOutbreakPrediction = async () => {
  return { message: "Not yet implemented" };
};

export const getAnomalyDetection = async () => {
  return { message: "Not yet implemented" };
};

export const getAIInsights = () => API.get('/ai-insights');
export const applyRecommendation = (id) => API.post(`/ai-insights/apply-recommendation/${id}`);