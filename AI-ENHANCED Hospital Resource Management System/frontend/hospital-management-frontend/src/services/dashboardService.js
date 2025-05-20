// File: services/dashboardService.js
import API from './api';

/**
 * Get dashboard statistics
 * @returns {Promise} - Response with dashboard statistics
 */
export const getDashboardStats = () => API.get('/dashboard/stats');

/**
 * Get dashboard alerts
 * @returns {Promise} - Response with dashboard alerts
 */
export const getDashboardAlerts = () => API.get('/dashboard/alerts');

/**
 * Get dashboard AI insights
 * @returns {Promise} - Response with dashboard AI insights
 */
export const getDashboardAIInsights = () => API.get('/dashboard/ai-insights');