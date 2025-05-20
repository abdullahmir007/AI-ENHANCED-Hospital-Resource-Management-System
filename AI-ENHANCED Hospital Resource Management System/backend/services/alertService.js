// File: services/alertService.js
import API from './api';

/**
 * Get alerts with optional filtering parameters
 * @param {Object} params - Query parameters for filtering alerts
 * @returns {Promise} - Response with alerts data
 */
export const getAlerts = (params) => API.get('/alerts', { params });

/**
 * Get a specific alert by ID
 * @param {string} id - Alert ID
 * @returns {Promise} - Response with alert data
 */
export const getAlertById = (id) => API.get(`/alerts/${id}`);

/**
 * Create a new alert
 * @param {Object} alertData - Alert data to create
 * @returns {Promise} - Response with created alert
 */
export const createAlert = (alertData) => API.post('/alerts', alertData);

/**
 * Update an existing alert
 * @param {string} id - Alert ID to update
 * @param {Object} alertData - Updated alert data
 * @returns {Promise} - Response with updated alert
 */
export const updateAlert = (id, alertData) => API.put(`/alerts/${id}`, alertData);

/**
 * Delete an alert
 * @param {string} id - Alert ID to delete
 * @returns {Promise} - Response with deletion confirmation
 */
export const deleteAlert = (id) => API.delete(`/alerts/${id}`);

/**
 * Mark an alert as read
 * @param {string} id - Alert ID to mark as read
 * @returns {Promise} - Response with updated alert
 */
export const markAsRead = (id) => API.put(`/alerts/${id}/read`);

/**
 * Mark all alerts as read
 * @returns {Promise} - Response with operation status
 */
export const markAllAsRead = () => API.put('/alerts/read-all');

/**
 * Get alert statistics
 * @returns {Promise} - Response with alert statistics
 */
export const getAlertStats = () => API.get('/alerts/stats');

/**
 * Acknowledge an alert
 * @param {string} id - Alert ID to acknowledge
 * @returns {Promise} - Response with updated alert
 */
export const acknowledgeAlert = (id) => API.put(`/alerts/${id}`, { status: 'Acknowledged' });

/**
 * Resolve an alert
 * @param {string} id - Alert ID to resolve
 * @param {Object} resolutionData - Resolution details
 * @returns {Promise} - Response with updated alert
 */
export const resolveAlert = (id, resolutionData) => API.put(`/alerts/${id}`, { 
  status: 'Resolved',
  resolution: resolutionData.resolution
});

/**
 * Assign an alert to a user
 * @param {string} id - Alert ID
 * @param {string} userId - User ID to assign
 * @returns {Promise} - Response with updated alert
 */
export const assignAlert = (id, userId) => API.put(`/alerts/${id}`, { assignedTo: userId });