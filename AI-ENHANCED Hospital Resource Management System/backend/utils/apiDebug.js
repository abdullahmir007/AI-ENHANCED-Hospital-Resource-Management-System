// src/utils/apiDebug.js

/**
 * Utility to debug API call URLs
 * This can be used to verify what URLs are being used for API calls
 */
export const debugApiCall = (endpoint, params = {}) => {
    // Get the base URL from environment or default
    const baseUrl = process.env.REACT_APP_API_URL || '/api';
    
    // Construct the full URL
    let url = `${baseUrl}${endpoint}`;
    
    // Add query parameters if any
    if (Object.keys(params).length > 0) {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      url += `?${queryString}`;
    }
    
    console.log('API Call URL:', url);
    return url;
  };
  
  /**
   * Test the API endpoint by making a GET request
   * This will help identify if the issue is with URL construction or server connectivity
   */
  export const testApiEndpoint = async (endpoint) => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || '/api';
      const url = `${baseUrl}${endpoint}`;
      
      console.log(`Testing API endpoint: ${url}`);
      
      // Make a simple fetch request
      const response = await fetch(url);
      const status = response.status;
      let data = null;
      
      try {
        data = await response.json();
      } catch (e) {
        console.log('Response is not JSON:', e);
      }
      
      console.log(`API Test Result - Status: ${status}`, data);
      
      return {
        success: response.ok,
        status,
        data
      };
    } catch (error) {
      console.error('API Test Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  /**
   * Add this to your Reports.js file to debug API paths
   */
  export const debugAllReportEndpoints = async () => {
    console.log('======= DEBUGGING API ENDPOINTS =======');
    await testApiEndpoint('/reports/test');
    await testApiEndpoint('/reports/bed-occupancy?dateRange=week');
    await testApiEndpoint('/reports/staff-utilization?dateRange=week');
    await testApiEndpoint('/reports/equipment-usage?dateRange=week');
    await testApiEndpoint('/reports/department-performance?dateRange=week');
    console.log('======= END DEBUGGING API ENDPOINTS =======');
  };