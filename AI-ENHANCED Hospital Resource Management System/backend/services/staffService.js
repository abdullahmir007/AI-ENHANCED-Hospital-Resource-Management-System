// File: services/staffService.js
import API from './api';

/**
 * Get all staff with optional filtering parameters
 * @param {Object} params - Query parameters for filtering staff
 * @returns {Promise} - Response with staff data
 */
export const getAllStaff = (params) => API.get('/staff', { params });

/**
 * Get a specific staff member by ID
 * @param {string} id - Staff ID
 * @returns {Promise} - Response with staff data
 */
export const getStaffById = (id) => API.get(`/staff/${id}`);

/**
 * Create a new staff member
 * @param {Object} staffData - Staff data to create
 * @returns {Promise} - Response with created staff member
 */
export const createStaff = (staffData) => API.post('/staff', staffData);

/**
 * Update an existing staff member
 * @param {string} id - Staff ID to update
 * @param {Object} staffData - Updated staff data
 * @returns {Promise} - Response with updated staff member
 */
export const updateStaff = (id, staffData) => API.put(`/staff/${id}`, staffData);

/**
 * Delete a staff member
 * @param {string} id - Staff ID to delete
 * @returns {Promise} - Response with deletion confirmation
 */
export const deleteStaff = (id) => API.delete(`/staff/${id}`);

/**
 * Get staff statistics
 * @returns {Promise} - Response with staff statistics
 */
export const getStaffStats = () => API.get('/staff/stats');

/**
 * Get staff schedule
 * @param {string} id - Staff ID
 * @param {Object} params - Optional parameters (startDate, endDate, limit)
 * @returns {Promise} - Response with staff schedule
 */
export const getStaffSchedule = (id, params) => API.get(`/staff/${id}/schedule`, { params });

/**
 * Update staff schedule
 * @param {string} id - Staff ID
 * @param {Object} scheduleData - Updated schedule data
 * @returns {Promise} - Response with updated staff member
 */
export const updateStaffSchedule = (id, scheduleData) => API.put(`/staff/${id}/schedule`, scheduleData);

/**
 * Get staff performance data
 * @param {string} id - Staff ID
 * @param {Object} params - Query parameters (period)
 * @returns {Promise} - Response with performance data
 */
export const getStaffPerformance = (id, params) => API.get(`/staff/${id}/performance`, { params });

/**
 * Assign staff to a task, department, etc.
 * @param {string} staffId - Staff ID
 * @param {Object} assignmentData - Assignment details
 * @returns {Promise} - Response with updated staff member
 */
export const assignStaff = (staffId, assignmentData) => API.put(`/staff/${staffId}/assign`, assignmentData);

/**
 * Get optimal staffing recommendations
 * @param {Object} params - Optional query parameters
 * @returns {Promise} - Response with optimization data
 */
export const getOptimalStaffing = (params) => API.get('/staff/optimal', { params });

/**
 * Get staff utilization data
 * @param {Object} params - Optional query parameters
 * @returns {Promise} - Response with utilization data
 */
export const getStaffUtilization = (params) => API.get('/staff/utilization', { params });

/**
 * Record overtime hours for staff
 * @param {string} staffId - Staff ID
 * @param {Object} overtimeData - Overtime details
 * @returns {Promise} - Response with updated staff member
 */
export const recordOvertime = (staffId, overtimeData) => API.post(`/staff/${staffId}/overtime`, overtimeData);

/**
 * Get staff availability for scheduling
 * @param {Object} params - Query parameters (startDate, endDate, staffType, department)
 * @returns {Promise} - Response with availability data
 */
export const getStaffAvailability = (params) => API.get('/staff/availability', { params });