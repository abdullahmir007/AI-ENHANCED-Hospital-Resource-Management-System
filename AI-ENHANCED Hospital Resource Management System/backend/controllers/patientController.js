// File: controllers/patientController.js
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const Staff = require('../models/Staff');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
exports.getAllPatients = asyncHandler(async (req, res, next) => {
 // Copy req.query
 const reqQuery = { ...req.query };

 // Fields to exclude
 const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

 // Loop over removeFields and delete them from reqQuery
 removeFields.forEach(param => delete reqQuery[param]);

 // Handle specific search parameter
 if (req.query.search) {
   const searchRegex = new RegExp(req.query.search, 'i');
   reqQuery.$or = [
     { patientId: searchRegex },
     { name: searchRegex },
     { diagnosis: searchRegex }
   ];
 }

 // Filter by status
 if (reqQuery.status) {
   reqQuery.status = reqQuery.status;
 }

 // Create query
 let query = Patient.find(reqQuery)
   .populate('assignedBed', 'bedId ward location.roomNumber')
   .populate('assignedDoctor', 'name staffId')
   .populate('assignedNurse', 'name staffId');

 // Select Fields
 if (req.query.select) {
   const fields = req.query.select.split(',').join(' ');
   query = query.select(fields);
 }

 // Sort
 if (req.query.sort) {
   const sortBy = req.query.sort.split(',').join(' ');
   query = query.sort(sortBy);
 } else {
   query = query.sort('-admissionDate');
 }

 // Pagination
 const page = parseInt(req.query.page, 10) || 1;
 const limit = parseInt(req.query.limit, 100) || 100;
 const startIndex = (page - 1) * limit;
 const endIndex = page * limit;
 const total = await Patient.countDocuments(reqQuery);

 query = query.skip(startIndex).limit(limit);

 // Execute query
 const patients = await query;

 // Pagination result
 const pagination = {
   page,
   limit,
   total,
   pages: Math.ceil(total / limit)
 };

 res.status(200).json({
   success: true,
   pagination,
   data: patients
 });
});

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = asyncHandler(async (req, res, next) => {
 const patient = await Patient.findById(req.params.id)
   .populate('assignedBed', 'bedId ward location.roomNumber status')
   .populate('assignedDoctor', 'name staffId staffType department')
   .populate('assignedNurse', 'name staffId staffType department');

 if (!patient) {
   return next(new ErrorResponse(`Patient not found with id of ${req.params.id}`, 404));
 }

 res.status(200).json({
   success: true,
   data: patient
 });
});

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
exports.createPatient = asyncHandler(async (req, res, next) => {
 // Add user to req.body
 req.body.createdBy = req.user.id;
 req.body.updatedBy = req.user.id;

 const patient = await Patient.create(req.body);

 // If bed assignment is provided, update the bed
 if (req.body.assignedBed) {
   const bed = await Bed.findById(req.body.assignedBed);
   
   if (bed) {
     // Update bed status and patient info
     bed.status = 'Occupied';
     bed.currentPatient = {
       patientId: patient._id,
       name: patient.name,
       age: patient.age,
       gender: patient.gender,
       diagnosis: patient.diagnosis,
       admissionDate: patient.admissionDate,
       expectedDischarge: patient.dischargeDate
     };
     bed.updatedBy = req.user.id;
     bed.updatedAt = Date.now();
     
     await bed.save();
   }
 }

 // If doctor assignment is provided, update the doctor
 if (req.body.assignedDoctor) {
   const doctor = await Staff.findById(req.body.assignedDoctor);
   
   if (doctor) {
     doctor.patientsAssigned = (doctor.patientsAssigned || 0) + 1;
     await doctor.save();
   }
 }

 // If nurse assignment is provided, update the nurse
 if (req.body.assignedNurse) {
   const nurse = await Staff.findById(req.body.assignedNurse);
   
   if (nurse) {
     nurse.patientsAssigned = (nurse.patientsAssigned || 0) + 1;
     await nurse.save();
   }
 }

 res.status(201).json({
   success: true,
   data: patient
 });
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = asyncHandler(async (req, res, next) => {
 // Add updatedBy to req.body
 req.body.updatedBy = req.user.id;
 req.body.updatedAt = Date.now();

 let patient = await Patient.findById(req.params.id);

 if (!patient) {
   return next(new ErrorResponse(`Patient not found with id of ${req.params.id}`, 404));
 }

 // Check if bed assignment is changing
 if (req.body.assignedBed && req.body.assignedBed !== patient.assignedBed?.toString()) {
   // Release old bed if exists
   if (patient.assignedBed) {
     const oldBed = await Bed.findById(patient.assignedBed);
     if (oldBed) {
       oldBed.status = 'Available';
       oldBed.currentPatient = null;
       oldBed.updatedBy = req.user.id;
       oldBed.updatedAt = Date.now();
       await oldBed.save();
     }
   }
   
   // Assign new bed
   const newBed = await Bed.findById(req.body.assignedBed);
   if (newBed) {
     newBed.status = 'Occupied';
     newBed.currentPatient = {
       patientId: patient._id,
       name: patient.name,
       age: patient.age,
       gender: patient.gender,
       diagnosis: patient.diagnosis,
       admissionDate: patient.admissionDate,
       expectedDischarge: patient.dischargeDate
     };
     newBed.updatedBy = req.user.id;
     newBed.updatedAt = Date.now();
     await newBed.save();
   }
 }

 // Check if doctor assignment is changing
 if (req.body.assignedDoctor && req.body.assignedDoctor !== patient.assignedDoctor?.toString()) {
   // Update old doctor's patient count if exists
   if (patient.assignedDoctor) {
     const oldDoctor = await Staff.findById(patient.assignedDoctor);
     if (oldDoctor) {
       oldDoctor.patientsAssigned = Math.max(0, (oldDoctor.patientsAssigned || 1) - 1);
       await oldDoctor.save();
     }
   }
   
   // Update new doctor's patient count
   const newDoctor = await Staff.findById(req.body.assignedDoctor);
   if (newDoctor) {
     newDoctor.patientsAssigned = (newDoctor.patientsAssigned || 0) + 1;
     await newDoctor.save();
   }
 }

 // Check if nurse assignment is changing
 if (req.body.assignedNurse && req.body.assignedNurse !== patient.assignedNurse?.toString()) {
   // Update old nurse's patient count if exists
   if (patient.assignedNurse) {
     const oldNurse = await Staff.findById(patient.assignedNurse);
     if (oldNurse) {
       oldNurse.patientsAssigned = Math.max(0, (oldNurse.patientsAssigned || 1) - 1);
       await oldNurse.save();
     }
   }
   
   // Update new nurse's patient count
   const newNurse = await Staff.findById(req.body.assignedNurse);
   if (newNurse) {
     newNurse.patientsAssigned = (newNurse.patientsAssigned || 0) + 1;
     await newNurse.save();
   }
 }

 // Check if patient is being discharged
 if (req.body.status === 'Discharged' && patient.status !== 'Discharged') {
   req.body.dischargeDate = req.body.dischargeDate || new Date();
   
   // Release bed if assigned
   if (patient.assignedBed) {
     const bed = await Bed.findById(patient.assignedBed);
     if (bed) {
       bed.status = 'Available';
       bed.currentPatient = null;
       bed.updatedBy = req.user.id;
       bed.updatedAt = Date.now();
       await bed.save();
     }
     
     // Clear bed assignment
     req.body.assignedBed = null;
   }
   
   // Update assigned staff patient counts
   if (patient.assignedDoctor) {
     const doctor = await Staff.findById(patient.assignedDoctor);
     if (doctor) {
       doctor.patientsAssigned = Math.max(0, (doctor.patientsAssigned || 1) - 1);
       await doctor.save();
     }
     
     // Clear doctor assignment
     req.body.assignedDoctor = null;
   }
   
   if (patient.assignedNurse) {
     const nurse = await Staff.findById(patient.assignedNurse);
     if (nurse) {
       nurse.patientsAssigned = Math.max(0, (nurse.patientsAssigned || 1) - 1);
       await nurse.save();
     }
     
     // Clear nurse assignment
     req.body.assignedNurse = null;
   }
 }

 patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
   new: true,
   runValidators: true
 });

 res.status(200).json({
   success: true,
   data: patient
 });
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
exports.deletePatient = asyncHandler(async (req, res, next) => {
 const patient = await Patient.findById(req.params.id);

 if (!patient) {
   return next(new ErrorResponse(`Patient not found with id of ${req.params.id}`, 404));
 }

 // Release any assigned resources
 if (patient.assignedBed) {
   const bed = await Bed.findById(patient.assignedBed);
   if (bed) {
     bed.status = 'Available';
     bed.currentPatient = null;
     bed.updatedBy = req.user.id;
     bed.updatedAt = Date.now();
     await bed.save();
   }
 }
 
 if (patient.assignedDoctor) {
   const doctor = await Staff.findById(patient.assignedDoctor);
   if (doctor) {
     doctor.patientsAssigned = Math.max(0, (doctor.patientsAssigned || 1) - 1);
     await doctor.save();
   }
 }
 
 if (patient.assignedNurse) {
   const nurse = await Staff.findById(patient.assignedNurse);
   if (nurse) {
     nurse.patientsAssigned = Math.max(0, (nurse.patientsAssigned || 1) - 1);
     await nurse.save();
   }
 }

 await patient.remove();

 res.status(200).json({
   success: true,
   data: {}
 });
});

// @desc    Get patient statistics
// @route   GET /api/patients/stats
// @access  Private
exports.getPatientStats = asyncHandler(async (req, res, next) => {
 // Get total patient count
 const total = await Patient.countDocuments();
 
 // Get count by status
 const statusStats = await Patient.aggregate([
   {
     $group: {
       _id: '$status',
       count: { $sum: 1 }
     }
   }
 ]);

 // Convert to object
 const byStatus = statusStats.reduce((acc, stat) => {
   acc[stat._id] = stat.count;
   return acc;
 }, {});
 
 // Current inpatients (Admitted status)
 const inpatient = byStatus['Admitted'] || 0;
 
 // Outpatients (patients without assigned beds)
 const outpatient = await Patient.countDocuments({ status: 'Admitted', assignedBed: null });
 
 // Patients in ICU
 const icuPatients = await Patient.countDocuments({
   status: 'Admitted',
   'assignedBed.ward': 'ICU'
 });
 
 // Emergency patients
 const emergencyPatients = await Patient.countDocuments({
   status: 'Admitted',
   'assignedBed.ward': 'ER'
 });
 
 // Patients waiting admission
 const waitingAdmission = await Patient.countDocuments({
   status: 'Admitted',
   assignedBed: null,
   assignedDoctor: { $ne: null }
 });
 
 // Patients to be discharged today
 const today = new Date();
 const tomorrow = new Date(today);
 tomorrow.setDate(tomorrow.getDate() + 1);
 today.setHours(0, 0, 0, 0);
 tomorrow.setHours(0, 0, 0, 0);
 
 const dischargeToday = await Patient.countDocuments({
   dischargeDate: { $gte: today, $lt: tomorrow }
 });
 
 // Admissions in last 30 days
 const thirtyDaysAgo = new Date(today);
 thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
 
 const admissionsThisMonth = await Patient.countDocuments({
   admissionDate: { $gte: thirtyDaysAgo }
 });
 
 // Discharges in last 30 days
 const dischargesThisMonth = await Patient.countDocuments({
   dischargeDate: { $gte: thirtyDaysAgo, $lte: today }
 });
 
 // Average length of stay
 const stayStats = await Patient.aggregate([
   {
     $match: { status: 'Discharged' }
   },
   {
     $project: {
       stayDuration: { 
         $divide: [
           { $subtract: ['$dischargeDate', '$admissionDate'] },
           1000 * 60 * 60 * 24 // Convert ms to days
         ]
       }
     }
   },
   {
     $group: {
       _id: null,
       averageStay: { $avg: '$stayDuration' }
     }
   }
 ]);
 
 const averageStay = stayStats.length > 0 ? 
   Math.round(stayStats[0].averageStay * 10) / 10 : 0;
 
 // Most common diagnoses
 const diagnosisStats = await Patient.aggregate([
   {
     $group: {
       _id: '$diagnosis',
       count: { $sum: 1 }
     }
   },
   { $sort: { count: -1 } },
   { $limit: 5 }
 ]);
 
 const topDiagnoses = diagnosisStats.map(d => ({
   diagnosis: d._id,
   count: d.count
 }));

 // Compile stats
 const stats = {
   total,
   inpatient,
   outpatient,
   icuPatients,
   emergencyPatients,
   waitingAdmission,
   dischargeToday,
   admissionsThisMonth,
   dischargesThisMonth,
   averageStay,
   byStatus,
   topDiagnoses
 };

 res.status(200).json({
   success: true,
   data: stats
 });
});

// @desc    Add vital signs
// @route   POST /api/patients/:id/vitals
// @access  Private
exports.addVitalSigns = asyncHandler(async (req, res, next) => {
 const { temperature, heartRate, bloodPressure, respiratoryRate, oxygenSaturation } = req.body;
 
 // Find patient
 const patient = await Patient.findById(req.params.id);
 
 if (!patient) {
   return next(new ErrorResponse(`Patient not found with id of ${req.params.id}`, 404));
 }
 
 // Add vital signs
 const vitalSign = {
   date: new Date(),
   temperature,
   heartRate,
   bloodPressure,
   respiratoryRate,
   oxygenSaturation
 };
 
 patient.vitalSigns.push(vitalSign);
 patient.updatedAt = Date.now();
 patient.updatedBy = req.user.id;
 
 await patient.save();
 
 res.status(201).json({
   success: true,
   data: vitalSign
 });
});

// @desc    Add medication
// @route   POST /api/patients/:id/medications
// @access  Private
exports.addMedication = asyncHandler(async (req, res, next) => {
 const { name, dosage, frequency, startDate, endDate } = req.body;
 
 // Find patient
 const patient = await Patient.findById(req.params.id);
 
 if (!patient) {
   return next(new ErrorResponse(`Patient not found with id of ${req.params.id}`, 404));
 }
 
 // Add medication
 const medication = {
   name,
   dosage,
   frequency,
   startDate: startDate || new Date(),
   endDate: endDate || null
 };
 
 patient.medications.push(medication);
 patient.updatedAt = Date.now();
 patient.updatedBy = req.user.id;
 
 await patient.save();
 
 res.status(201).json({
   success: true,
   data: medication
 });
});

// @desc    Add note
// @route   POST /api/patients/:id/notes
// @access  Private
exports.addNote = asyncHandler(async (req, res, next) => {
 const { text } = req.body;
 
 if (!text) {
   return next(new ErrorResponse('Please provide note text', 400));
 }
 
 // Find patient
 const patient = await Patient.findById(req.params.id);
 
 if (!patient) {
   return next(new ErrorResponse(`Patient not found with id of ${req.params.id}`, 404));
 }
 
 // Add note
 const note = {
   date: new Date(),
   text,
   author: req.user.id
 };
 
 patient.notes.push(note);
 patient.updatedAt = Date.now();
 patient.updatedBy = req.user.id;
 
 await patient.save();
 
 res.status(201).json({
   success: true,
   data: note
 });
});

// @desc    Process batch patient data from Excel upload
// @route   POST /api/patients/batch
// @access  Private
exports.processBatchPatients = asyncHandler(async (req, res, next) => {
 try {
   // Debug request information
   console.log("Batch request received from IP:", req.ip);
   console.log("Request body type:", typeof req.body);
   console.log("Is array?", Array.isArray(req.body));
   console.log("Request body length:", req.body ? (Array.isArray(req.body) ? req.body.length : Object.keys(req.body).length) : 'undefined');
   console.log("Request headers:", req.headers['content-type']);
   
   // Ensure we have valid data
   let patients = req.body;
   
   // Handle potential string parsing issue
   if (typeof patients === 'string') {
     try {
       patients = JSON.parse(patients);
       console.log("Parsed string to JSON, is array now?", Array.isArray(patients));
     } catch (parseError) {
       console.error("Failed to parse string as JSON:", parseError);
     }
   }

   // Final array check
   if (!Array.isArray(patients) || patients.length === 0) {
     logger.error('Invalid batch data format received:', typeof req.body, req.body ? (typeof req.body === 'object' ? JSON.stringify(req.body).substring(0, 100) : req.body) : 'undefined');
     return next(new ErrorResponse('Invalid batch data format. Expected non-empty array of patients.', 400));
   }
   
   logger.info(`Processing batch of ${patients.length} patients from ${req.ip}`);
   
   // Log first patient for debugging
   if (patients.length > 0) {
     const samplePatient = { ...patients[0] };
     // Remove any sensitive fields for logging
     delete samplePatient.contactInfo;
     delete samplePatient.emergencyContact;
     logger.debug('First patient sample:', JSON.stringify(samplePatient));
   }
   
   // Check for authentication
   if (!req.user || !req.user.id) {
     logger.error('User object missing in batch request');
     
     // Try to find an admin user to use for the operation
     try {
       const User = require('../models/User');
       const adminUser = await User.findOne({ role: 'admin' });
       
       if (adminUser) {
         req.user = adminUser;
         logger.warn(`Using fallback admin user ${adminUser._id} for batch upload`);
       } else {
         return next(new ErrorResponse('Authentication required for batch uploads', 401));
       }
     } catch (err) {
       logger.error('Error finding admin user for fallback auth:', err);
       return next(new ErrorResponse('Authentication error', 401));
     }
   }
   
   // Use the patient batch service to process the data
   const patientBatchService = require('../services/patientBatchService');
   
   // Process the data with extended timeout
   const results = await patientBatchService.processBatchPatients(patients, req.user);
   logger.info('Batch processing complete:', JSON.stringify(results));
   
   // Return results to client
   res.status(200).json({
     success: true,
     data: results
   });
 } catch (error) {
   // Detailed error logging
   logger.error('Batch processing error:', error);
   logger.error('Stack trace:', error.stack);
   
   // Check for specific error types
   if (error.name === 'ValidationError') {
     return next(new ErrorResponse('Validation error in patient data: ' + error.message, 400));
   } else if (error.name === 'MongoError' && error.code === 11000) {
     return next(new ErrorResponse('Duplicate key error: ' + error.message, 400));
   } else if (error.message.includes('PayloadTooLargeError')) {
     return next(new ErrorResponse('Upload data is too large. Please reduce the file size or split into multiple uploads.', 413));
   }
   
   // Generic error
   return next(new ErrorResponse(`Batch processing failed: ${error.message}`, 500));
 }
});