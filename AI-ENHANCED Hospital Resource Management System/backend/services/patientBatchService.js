// File: services/patientBatchService.js
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const Staff = require('../models/Staff');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
* Process a batch of patient data
* @param {Array} patients - Array of patient data objects
* @param {Object} user - Current user making the request
* @returns {Object} - Results of batch processing
*/
exports.processBatchPatients = async (patients, user) => {
 const results = {
   added: 0,
   updated: 0,
   discharged: 0,
   errors: 0,
   errorDetails: []
 };

 if (!Array.isArray(patients)) {
   throw new Error('Invalid input: expected an array of patients');
 }

 logger.info(`Processing batch of ${patients.length} patients`);

 // Process each patient record
 for (const patientData of patients) {
   try {
     // Process the patient
     const result = await processPatient(patientData, user);
     
     // Update the results based on the operation
     if (result.operation === 'added') {
       results.added++;
     } else if (result.operation === 'updated') {
       results.updated++;
       
       // Check if the patient was discharged
       if (result.discharged) {
         results.discharged++;
       }
     }
   } catch (error) {
     logger.error(`Error processing patient ${patientData.patientId || 'unknown'}:`, error);
     results.errors++;
     results.errorDetails.push(`${patientData.patientId || 'unknown'}: ${error.message}`);
   }
 }

 logger.info(`Batch processing complete: ${JSON.stringify(results)}`);
 return results;
};

/**
* Process an individual patient record
* @param {Object} patientData - Patient data
* @param {Object} user - Current user
* @returns {Object} - Result of the operation
*/
const processPatient = async (patientData, user) => {
 // Validate required fields
 if (!patientData.patientId || !patientData.name || !patientData.gender || 
     !patientData.diagnosis || !patientData.status || patientData.age === undefined) {
   throw new Error(`Missing required fields for patient ${patientData.patientId || 'unknown'}`);
 }
 
 // Format patient data
 const formattedData = formatPatientData(patientData);
 
 // Add user reference
 formattedData.updatedBy = user.id;
 formattedData.updatedAt = Date.now();
 
 // Check if patient exists
 const existingPatient = await Patient.findOne({ patientId: formattedData.patientId });
 
 if (existingPatient) {
   // Track if the patient was discharged
   let discharged = false;
   
   // Special handling for discharge
   if (formattedData.status === 'Discharged' && existingPatient.status !== 'Discharged') {
     formattedData.dischargeDate = formattedData.dischargeDate || new Date();
     discharged = true;
     
     // Handle resource release on discharge
     await releasePatientResources(existingPatient, user);
   }
   
   // Handle potential resource assignments
   await handleResourceAssignments(formattedData, existingPatient, user);
   
   // Update existing patient
   await Patient.findByIdAndUpdate(existingPatient._id, formattedData, {
     runValidators: true
   });
   
   return { operation: 'updated', discharged };
 } else {
   // Create new patient
   formattedData.createdBy = user.id;
   
   // Ensure admission date is set
   if (!formattedData.admissionDate) {
     formattedData.admissionDate = new Date();
   }
   
   // Handle resource assignments
   await handleResourceAssignments(formattedData, null, user);
   
   // Create the patient
   await Patient.create(formattedData);
   
   return { operation: 'added' };
 }
};

/**
* Format patient data from Excel format to database format
* @param {Object} data - Raw patient data
* @returns {Object} - Formatted patient data
*/
const formatPatientData = (data) => {
 const formattedData = { ...data };
 
 // Format dates
 if (data.admissionDate) {
   try {
     formattedData.admissionDate = new Date(data.admissionDate);
     if (isNaN(formattedData.admissionDate.getTime())) {
       // If invalid date, use current date
       formattedData.admissionDate = new Date();
     }
   } catch (error) {
     formattedData.admissionDate = new Date();
   }
 }
 
 if (data.dischargeDate) {
   try {
     formattedData.dischargeDate = new Date(data.dischargeDate);
     if (isNaN(formattedData.dischargeDate.getTime())) {
       // If invalid date, set to null
       formattedData.dischargeDate = null;
     }
   } catch (error) {
     formattedData.dischargeDate = null;
   }
 }
 
 // Format nested objects
 if (data['contactInfo.phone'] || data['contactInfo.email'] || data['contactInfo.address']) {
   formattedData.contactInfo = {
     phone: data['contactInfo.phone'] || '',
     email: data['contactInfo.email'] || '',
     address: data['contactInfo.address'] || ''
   };
   
   // Remove the flattened properties
   delete formattedData['contactInfo.phone'];
   delete formattedData['contactInfo.email'];
   delete formattedData['contactInfo.address'];
 }
 
 if (data['emergencyContact.name'] || data['emergencyContact.relationship'] || data['emergencyContact.phone']) {
   formattedData.emergencyContact = {
     name: data['emergencyContact.name'] || '',
     relationship: data['emergencyContact.relationship'] || '',
     phone: data['emergencyContact.phone'] || ''
   };
   
   // Remove the flattened properties
   delete formattedData['emergencyContact.name'];
   delete formattedData['emergencyContact.relationship'];
   delete formattedData['emergencyContact.phone'];
 }
 
 // Format allergies from string to array if needed
 if (typeof data.allergies === 'string') {
   formattedData.allergies = data.allergies
     .split(',')
     .map(item => item.trim())
     .filter(item => item.length > 0);
 } else if (data.allergies === undefined || data.allergies === null) {
   formattedData.allergies = [];
 }
 
 // Ensure age is a number
 if (data.age !== undefined) {
   formattedData.age = parseInt(data.age, 10);
   if (isNaN(formattedData.age)) {
     formattedData.age = 0;
   }
 }
 
 // *** IMPORTANT FIX: Handle empty strings for ObjectId fields ***
 // For reference fields that need to be ObjectIds, null out empty strings
 if (formattedData.assignedBed === '' || formattedData.assignedBed === undefined) {
   formattedData.assignedBed = null;
 }
 
 if (formattedData.assignedDoctor === '' || formattedData.assignedDoctor === undefined) {
   formattedData.assignedDoctor = null;
 }
 
 if (formattedData.assignedNurse === '' || formattedData.assignedNurse === undefined) {
   formattedData.assignedNurse = null;
 }
 
 // Validate and clean createdBy/updatedBy fields if present
 if (formattedData.createdBy === '' || formattedData.createdBy === undefined) {
   delete formattedData.createdBy; // Let the controller set this
 }
 
 if (formattedData.updatedBy === '' || formattedData.updatedBy === undefined) {
   delete formattedData.updatedBy; // Let the controller set this
 }
 
 return formattedData;
};

/**
* Handle resource assignments for a patient
* @param {Object} patientData - Patient data
* @param {Object} existingPatient - Existing patient (if any)
* @param {Object} user - Current user
*/
const handleResourceAssignments = async (patientData, existingPatient, user) => {
 try {
   // Skip if all assignments are null
   if (!patientData.assignedBed && !patientData.assignedDoctor && !patientData.assignedNurse) {
     return;
   }
   
   // Handle bed assignment
   if (patientData.assignedBed) {
     // Release old bed if assigned and changing
     if (existingPatient && 
         existingPatient.assignedBed && 
         existingPatient.assignedBed.toString() !== patientData.assignedBed.toString()) {
       try {
         const oldBed = await Bed.findById(existingPatient.assignedBed);
         if (oldBed) {
           oldBed.status = 'Available';
           oldBed.currentPatient = null;
           oldBed.updatedBy = user.id;
           oldBed.updatedAt = Date.now();
           await oldBed.save();
         }
       } catch (err) {
         console.error(`Error releasing old bed: ${err.message}`);
         // Continue processing even if old bed update fails
       }
     }
     
     // Assign new bed
     try {
       const bed = await Bed.findById(patientData.assignedBed);
       if (bed) {
         bed.status = 'Occupied';
         bed.currentPatient = {
           patientId: existingPatient ? existingPatient._id : null, // Will be updated after patient creation
           name: patientData.name,
           age: patientData.age,
           gender: patientData.gender,
           diagnosis: patientData.diagnosis,
           admissionDate: patientData.admissionDate || new Date(),
           expectedDischarge: patientData.dischargeDate
         };
         bed.updatedBy = user.id;
         bed.updatedAt = Date.now();
         await bed.save();
       }
     } catch (err) {
       console.error(`Error assigning new bed: ${err.message}`);
     }
   }
   
   // Handle doctor assignment
   if (patientData.assignedDoctor) {
     try {
       // Update old doctor's patient count if exists and changing
       if (existingPatient && 
           existingPatient.assignedDoctor && 
           existingPatient.assignedDoctor.toString() !== patientData.assignedDoctor.toString()) {
         const oldDoctor = await Staff.findById(existingPatient.assignedDoctor);
         if (oldDoctor) {
           oldDoctor.patientsAssigned = Math.max(0, (oldDoctor.patientsAssigned || 1) - 1);
           await oldDoctor.save();
         }
       }
       
       // Update new doctor's patient count
       const doctor = await Staff.findById(patientData.assignedDoctor);
       if (doctor) {
         doctor.patientsAssigned = (doctor.patientsAssigned || 0) + 1;
         await doctor.save();
       }
     } catch (err) {
       console.error(`Error handling doctor assignment: ${err.message}`);
     }
   }
   
   // Handle nurse assignment
   if (patientData.assignedNurse) {
     try {
       // Update old nurse's patient count if exists and changing
       if (existingPatient && 
           existingPatient.assignedNurse && 
           existingPatient.assignedNurse.toString() !== patientData.assignedNurse.toString()) {
         const oldNurse = await Staff.findById(existingPatient.assignedNurse);
         if (oldNurse) {
           oldNurse.patientsAssigned = Math.max(0, (oldNurse.patientsAssigned || 1) - 1);
           await oldNurse.save();
         }
       }
       
       // Update new nurse's patient count
       const nurse = await Staff.findById(patientData.assignedNurse);
       if (nurse) {
         nurse.patientsAssigned = (nurse.patientsAssigned || 0) + 1;
         await nurse.save();
       }
     } catch (err) {
       console.error(`Error handling nurse assignment: ${err.message}`);
     }
   }
 } catch (error) {
   console.error("Error in resource assignment:", error);
   // Don't throw, just log and continue
 }
};

/**
* Release all resources assigned to a patient
* @param {Object} patient - Patient
* @param {Object} user - Current user
*/
const releasePatientResources = async (patient, user) => {
 try {
   // Release bed if assigned
   if (patient.assignedBed) {
     try {
       const bed = await Bed.findById(patient.assignedBed);
       if (bed) {
         bed.status = 'Available';
         bed.currentPatient = null;
         bed.updatedBy = user.id;
         bed.updatedAt = Date.now();
         await bed.save();
       }
     } catch (err) {
       console.error(`Error releasing bed: ${err.message}`);
     }
   }
   
   // Update doctor's patient count
   if (patient.assignedDoctor) {
     try {
       const doctor = await Staff.findById(patient.assignedDoctor);
       if (doctor) {
         doctor.patientsAssigned = Math.max(0, (doctor.patientsAssigned || 1) - 1);
         await doctor.save();
       }
     } catch (err) {
       console.error(`Error updating doctor patient count: ${err.message}`);
     }
   }
   
   // Update nurse's patient count
   if (patient.assignedNurse) {
     try {
       const nurse = await Staff.findById(patient.assignedNurse);
       if (nurse) {
         nurse.patientsAssigned = Math.max(0, (nurse.patientsAssigned || 1) - 1);
         await nurse.save();
       }
     } catch (err) {
       console.error(`Error updating nurse patient count: ${err.message}`);
     }
   }
 } catch (error) {
   console.error("Error in resource release:", error);
   // Don't throw, just log and continue
 }
};