// File: services/bedService.js
import API from './api';

/**
 * Get all beds with optional filtering parameters
 * @param {Object} params - Query parameters for filtering beds
 * @returns {Promise} - Response with beds data
 */
export const getAllBeds = (params) => {
  return API.get('/beds', { params });
};

/**
 * Get a specific bed by ID
 * @param {string} id - Bed ID
 * @returns {Promise} - Response with bed data
 */
export const getBedById = (id) => API.get(`/beds/${id}`);

/**
 * Create a new bed
 * @param {Object} bedData - Bed data to create
 * @returns {Promise} - Response with created bed
 */
export const createBed = (bedData) => API.post('/beds', bedData);

/**
 * Update an existing bed
 * @param {string} id - Bed ID to update
 * @param {Object} bedData - Updated bed data
 * @returns {Promise} - Response with updated bed
 */
export const updateBed = (id, bedData) => API.put(`/beds/${id}`, bedData);

/**
 * Delete a bed
 * @param {string} id - Bed ID to delete
 * @returns {Promise} - Response with deletion confirmation
 */
export const deleteBed = (id) => API.delete(`/beds/${id}`);

/**
 * Get bed statistics
 * @returns {Promise} - Response with bed statistics
 */
export const getBedStats = () => API.get('/beds/stats');

/**
 * Assign a bed to a patient
 * @param {string} id - Bed ID
 * @param {string} patientId - Patient ID to assign
 * @returns {Promise} - Response with updated bed
 */
export const assignBed = (id, patientId) => API.put(`/beds/${id}/assign`, { patientId });

/**
 * Release a bed (make it available)
 * @param {string} id - Bed ID to release
 * @returns {Promise} - Response with updated bed
 */
export const releaseBed = (id) => API.put(`/beds/${id}/release`);

/**
 * Reserve a bed
 * @param {string} id - Bed ID to reserve
 * @param {Object} reservationData - Reservation details
 * @returns {Promise} - Response with updated bed
 */
export const reserveBed = (id, reservationData) => API.put(`/beds/${id}/reserve`, reservationData);

/**
 * Upload Excel file to update beds
 * @param {FormData} formData - FormData containing the Excel file
 * @returns {Promise} - Response with update results
 */
export const uploadBedExcel = (formData) => {
  return API.post('/beds/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};