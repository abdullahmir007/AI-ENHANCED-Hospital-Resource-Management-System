import axios from './api';
import { toast } from 'react-toastify';

// Get alerts with optional filters
export const getAlerts = async (filters = {}) => {
  try {
    return await axios.get('/alerts', { params: filters });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    toast.error('Failed to fetch alerts');
    throw error;
  }
};

// Get a single alert by ID
export const getAlertById = async (alertId) => {
  try {
    return await axios.get(`/alerts/${alertId}`);
  } catch (error) {
    console.error(`Error fetching alert ${alertId}:`, error);
    toast.error('Failed to fetch alert details');
    throw error;
  }
};

// Create a new alert
export const createAlert = async (alertData) => {
  try {
    return await axios.post('/alerts', alertData);
  } catch (error) {
    console.error('Error creating alert:', error);
    toast.error('Failed to create alert');
    throw error;
  }
};

// Update an alert
export const updateAlert = async (alertId, alertData) => {
  try {
    return await axios.put(`/alerts/${alertId}`, alertData);
  } catch (error) {
    console.error(`Error updating alert ${alertId}:`, error);
    toast.error('Failed to update alert');
    throw error;
  }
};

// Acknowledge an alert
export const acknowledgeAlert = async (alertId) => {
  try {
    return await axios.post(`/alerts/${alertId}/acknowledge`);
  } catch (error) {
    console.error(`Error acknowledging alert ${alertId}:`, error);
    toast.error('Failed to acknowledge alert');
    throw error;
  }
};

// Resolve an alert
export const resolveAlert = async (alertId, resolutionNotes) => {
  try {
    return await axios.post(`/alerts/${alertId}/resolve`, { resolutionNotes });
  } catch (error) {
    console.error(`Error resolving alert ${alertId}:`, error);
    toast.error('Failed to resolve alert');
    throw error;
  }
};

// Mark alert as read
export const markAsRead = async (alertId) => {
  try {
    return await axios.post(`/alerts/${alertId}/read`);
  } catch (error) {
    console.error(`Error marking alert ${alertId} as read:`, error);
    toast.error('Failed to mark alert as read');
    throw error;
  }
};

// Mark all alerts as read
export const markAllAsRead = async () => {
  try {
    return await axios.post('/alerts/read-all');
  } catch (error) {
    console.error('Error marking all alerts as read:', error);
    toast.error('Failed to mark all alerts as read');
    throw error;
  }
};

// Delete an alert
export const deleteAlert = async (alertId) => {
  try {
    return await axios.delete(`/alerts/${alertId}`);
  } catch (error) {
    console.error(`Error deleting alert ${alertId}:`, error);
    toast.error('Failed to delete alert');
    throw error;
  }
};