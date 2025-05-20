// File: services/equipmentService.js
import API from './api';

/**
 * Get all equipment with optional filtering parameters
 * @param {Object} params - Query parameters for filtering equipment
 * @returns {Promise} - Response with equipment data
 */
export const getAllEquipment = (params) => API.get('/equipment', { params });

/**
 * Get a specific equipment by ID
 * @param {string} id - Equipment ID
 * @returns {Promise} - Response with equipment data
 */
export const getEquipmentById = (id) => API.get(`/equipment/${id}`);

/**
 * Create new equipment
 * @param {Object} equipmentData - Equipment data to create
 * @returns {Promise} - Response with created equipment
 */
export const createEquipment = (equipmentData) => API.post('/equipment', equipmentData);

/**
 * Update existing equipment
 * @param {string} id - Equipment ID to update
 * @param {Object} equipmentData - Updated equipment data
 * @returns {Promise} - Response with updated equipment
 */
export const updateEquipment = (id, equipmentData) => API.put(`/equipment/${id}`, equipmentData);

/**
 * Delete equipment
 * @param {string} id - Equipment ID to delete
 * @returns {Promise} - Response with deletion confirmation
 */
export const deleteEquipment = (id) => API.delete(`/equipment/${id}`);

/**
 * Get equipment statistics
 * @returns {Promise} - Response with equipment statistics
 */
export const getEquipmentStats = () => API.get('/equipment/stats');

/**
 * Update equipment usage status
 * @param {string} id - Equipment ID
 * @param {Object} statusData - Status data (status, patient, department, etc.)
 * @returns {Promise} - Response with updated equipment
 */
export const updateUsageStatus = (id, statusData) => API.put(`/equipment/${id}/usage`, statusData);

/**
 * Add maintenance record for equipment
 * @param {string} id - Equipment ID
 * @param {Object} maintenanceData - Maintenance data
 * @returns {Promise} - Response with updated equipment
 */
export const addMaintenanceRecord = (id, maintenanceData) => API.post(`/equipment/${id}/maintenance`, maintenanceData);

/**
 * Get scheduled maintenance data
 * @param {Object} params - Query parameters (timeframe, priority, status)
 * @returns {Promise} - Response with maintenance schedule
 */
export const getScheduledMaintenance = (params) => API.get('/equipment/maintenance', { params });

/**
 * Schedule maintenance for equipment
 * @param {string} id - Equipment ID
 * @param {Object} scheduleData - Maintenance schedule data
 * @returns {Promise} - Response with updated equipment
 */
export const scheduleMaintenance = (id, scheduleData) => API.post(`/equipment/${id}/schedule-maintenance`, scheduleData);

/**
 * Complete maintenance for equipment
 * @param {string} id - Equipment ID
 * @param {Object} completionData - Maintenance completion data
 * @returns {Promise} - Response with updated equipment
 */
export const completeMaintenance = (id, completionData) => API.put(`/equipment/${id}/complete-maintenance`, completionData);