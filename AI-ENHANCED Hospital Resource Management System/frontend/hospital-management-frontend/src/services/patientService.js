// services/patientService.js
import API from './api';

/**
 * Get all patients with optional filtering parameters
 * @param {Object} params - Query parameters for filtering patients
 * @returns {Promise} - Response with patients data
 */
export const getAllPatients = (params) => API.get('/patients', { params });

/**
 * Get a specific patient by ID
 * @param {string} id - Patient ID
 * @returns {Promise} - Response with patient data
 */
export const getPatientById = (id) => API.get(`/patients/${id}`);

/**
 * Create a new patient
 * @param {Object} patientData - Patient data to create
 * @returns {Promise} - Response with created patient
 */
export const createPatient = (patientData) => API.post('/patients', patientData);

/**
 * Update an existing patient
 * @param {string} id - Patient ID to update
 * @param {Object} patientData - Updated patient data
 * @returns {Promise} - Response with updated patient
 */
export const updatePatient = (id, patientData) => API.put(`/patients/${id}`, patientData);

/**
 * Delete a patient
 * @param {string} id - Patient ID to delete
 * @returns {Promise} - Response with deletion confirmation
 */
export const deletePatient = (id) => API.delete(`/patients/${id}`);

/**
 * Get patient statistics
 * @returns {Promise} - Response with patient statistics
 */
export const getPatientStats = () => API.get('/patients/stats');

/**
 * Add vital signs for a patient
 * @param {string} id - Patient ID
 * @param {Object} vitalData - Vital signs data
 * @returns {Promise} - Response with updated patient
 */
export const addVitalSigns = (id, vitalData) => API.post(`/patients/${id}/vitals`, vitalData);

/**
 * Add medication for a patient
 * @param {string} id - Patient ID
 * @param {Object} medicationData - Medication data
 * @returns {Promise} - Response with updated patient
 */
export const addMedication = (id, medicationData) => API.post(`/patients/${id}/medications`, medicationData);

/**
 * Add a note to a patient's record
 * @param {string} id - Patient ID
 * @param {Object} noteData - Note data
 * @returns {Promise} - Response with updated patient
 */
export const addNote = (id, noteData) => API.post(`/patients/${id}/notes`, noteData);

/**
 * Upload a batch of patient data
 * @param {Array} patientsData - Array of patient data to process
 * @returns {Promise} - Response with batch processing results
 */
export const uploadPatientBatch = (patientsData) => {
  // Verify patientsData is an array
  if (!Array.isArray(patientsData)) {
    console.error('Invalid patient data format:', patientsData);
    throw new Error('Patient data must be an array');
  }
  
  console.log('Sending batch data to server:', patientsData.length, 'records');
  
  // Send the data
  return API.post('/patients/batch', patientsData, {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 60000 // 60 second timeout for large batches
  });
};

/**
 * Discharge a patient
 * @param {string} id - Patient ID
 * @param {Object} dischargeData - Discharge details
 * @returns {Promise} - Response with updated patient
 */
export const dischargePatient = (id, dischargeData) => API.put(`/patients/${id}/discharge`, dischargeData);

/**
 * Transfer a patient
 * @param {string} id - Patient ID
 * @param {Object} transferData - Transfer details
 * @returns {Promise} - Response with updated patient
 */
export const transferPatient = (id, transferData) => API.put(`/patients/${id}/transfer`, transferData);