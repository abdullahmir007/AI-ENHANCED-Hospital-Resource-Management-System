// src/services/api.js
import axios from 'axios';

// Use the base URL that works with your other modules
const API_URL = 'http://localhost:5000/api';

// Create axios instance with default configuration
const API = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Increased timeout for large requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding auth token
API.interceptors.request.use(
  config => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Log token presence for debugging (remove in production)
    if (token) {
      console.log(`Token found for request to ${config.url}`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`No token found for request to ${config.url}`);
    }
    
    // For large POST requests (like batch uploads), ensure content type is set
    if (config.method === 'post' && config.data && 
        (config.url.includes('/batch') || JSON.stringify(config.data).length > 10000)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration
API.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      
      // Clear token if it's invalid/expired
      localStorage.removeItem('token');
      
      // Redirect to login if needed
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default API;