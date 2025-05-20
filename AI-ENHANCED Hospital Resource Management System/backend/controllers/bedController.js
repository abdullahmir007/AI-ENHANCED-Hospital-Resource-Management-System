// File: controllers/bedController.js
const Bed = require('../models/Bed');
const Patient = require('../models/Patient');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const { paginate } = require('../utils/helpers');
const XLSX = require('xlsx');
const mongoose = require('mongoose');

// @desc    Get all beds
// @route   GET /api/beds
// @access  Private
exports.getAllBeds = asyncHandler(async (req, res, next) => {
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
      { bedId: searchRegex },
      { 'location.roomNumber': searchRegex },
      { 'currentPatient.name': searchRegex }
    ];
  }

  // Convert ward filter to exact match
  if (reqQuery.ward) {
    reqQuery.ward = reqQuery.ward;
  }

  // Filter by status
  if (reqQuery.status) {
    reqQuery.status = reqQuery.status;
  }

  // Create query
  let query = Bed.find(reqQuery);

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
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bed.countDocuments(reqQuery);

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const beds = await query;

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
    data: beds
  });
});

// @desc    Get single bed
// @route   GET /api/beds/:id
// @access  Private
exports.getBed = asyncHandler(async (req, res, next) => {
  const bed = await Bed.findById(req.params.id);

  if (!bed) {
    return next(new ErrorResponse(`Bed not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: bed
  });
});

// @desc    Create new bed
// @route   POST /api/beds
// @access  Private
exports.createBed = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const bed = await Bed.create(req.body);

  res.status(201).json({
    success: true,
    data: bed
  });
});

// @desc    Update bed
// @route   PUT /api/beds/:id
// @access  Private
exports.updateBed = asyncHandler(async (req, res, next) => {
  // Add updatedBy to req.body
  req.body.updatedBy = req.user.id;
  req.body.updatedAt = Date.now();

  let bed = await Bed.findById(req.params.id);

  if (!bed) {
    return next(new ErrorResponse(`Bed not found with id of ${req.params.id}`, 404));
  }

  bed = await Bed.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: bed
  });
});

// @desc    Delete bed
// @route   DELETE /api/beds/:id
// @access  Private
exports.deleteBed = asyncHandler(async (req, res, next) => {
  const bed = await Bed.findById(req.params.id);

  if (!bed) {
    return next(new ErrorResponse(`Bed not found with id of ${req.params.id}`, 404));
  }

  // Check if bed is occupied
  if (bed.status === 'Occupied') {
    return next(new ErrorResponse(`Cannot delete an occupied bed`, 400));
  }

  await bed.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get bed statistics
// @route   GET /api/beds/stats
// @access  Private
exports.getBedStats = asyncHandler(async (req, res, next) => {
  // Get counts by ward
  const wardStats = await Bed.aggregate([
    {
      $group: {
        _id: '$ward',
        total: { $sum: 1 },
        occupied: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] 
          } 
        },
        available: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] 
          } 
        }
      }
    },
    {
      $project: {
        _id: 0,
        ward: '$_id',
        total: 1,
        occupied: 1,
        available: 1,
        occupancyRate: { 
          $round: [{ $multiply: [{ $divide: ['$occupied', '$total'] }, 100] }, 1] 
        }
      }
    }
  ]);

  // Convert array to object with ward names as keys
  const byWard = wardStats.reduce((acc, stat) => {
    acc[stat.ward] = stat;
    return acc;
  }, {});

  // Get overall stats
  const totalBeds = await Bed.countDocuments();
  const occupiedBeds = await Bed.countDocuments({ status: 'Occupied' });
  const availableBeds = await Bed.countDocuments({ status: 'Available' });
  const reservedBeds = await Bed.countDocuments({ status: 'Reserved' });
  const maintenanceBeds = await Bed.countDocuments({ status: 'Maintenance' });

  const stats = {
    total: totalBeds,
    occupied: occupiedBeds,
    available: availableBeds,
    reserved: reservedBeds,
    maintenance: maintenanceBeds,
    occupancyRate: Math.round((occupiedBeds / totalBeds) * 100),
    byWard
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Assign bed to patient
// @route   PUT /api/beds/:id/assign
// @access  Private
exports.assignBed = asyncHandler(async (req, res, next) => {
  const { patientId } = req.body;

  if (!patientId) {
    return next(new ErrorResponse('Please provide a patient ID', 400));
  }

  // Find bed and patient
  const bed = await Bed.findById(req.params.id);
  const patient = await Patient.findById(patientId);

  if (!bed) {
    return next(new ErrorResponse(`Bed not found with id of ${req.params.id}`, 404));
  }

  if (!patient) {
    return next(new ErrorResponse(`Patient not found with id of ${patientId}`, 404));
  }

  // Check if bed is available
  if (bed.status !== 'Available' && bed.status !== 'Reserved') {
    return next(new ErrorResponse(`Bed is not available for assignment`, 400));
  }

  // Check if patient already has an assigned bed
  if (patient.assignedBed) {
    return next(new ErrorResponse(`Patient already has an assigned bed`, 400));
  }

  // Update bed with patient info
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

  // Update patient with bed info
  patient.assignedBed = bed._id;
  patient.updatedBy = req.user.id;
  patient.updatedAt = Date.now();

  // Save both documents
  await bed.save();
  await patient.save();

  res.status(200).json({
    success: true,
    data: bed
  });
});

// @desc    Release bed
// @route   PUT /api/beds/:id/release
// @access  Private
exports.releaseBed = asyncHandler(async (req, res, next) => {
  const bed = await Bed.findById(req.params.id);

  if (!bed) {
    return next(new ErrorResponse(`Bed not found with id of ${req.params.id}`, 404));
  }

  // If bed is occupied, update the patient record
  if (bed.status === 'Occupied' && bed.currentPatient && bed.currentPatient.patientId) {
    const patient = await Patient.findById(bed.currentPatient.patientId);
    
    if (patient) {
      patient.assignedBed = null;
      patient.updatedBy = req.user.id;
      patient.updatedAt = Date.now();
      await patient.save();
    }
  }

  // Update bed status
  bed.status = 'Available';
  bed.currentPatient = null;
  bed.reservedFor = null;
  bed.reservationTime = null;
  bed.updatedBy = req.user.id;
  bed.updatedAt = Date.now();

  await bed.save();

  res.status(200).json({
    success: true,
    data: bed
  });
});

// @desc    Reserve bed
// @route   PUT /api/beds/:id/reserve
// @access  Private
exports.reserveBed = asyncHandler(async (req, res, next) => {
  const { name, admissionTime } = req.body;

  if (!name) {
    return next(new ErrorResponse('Please provide a name for reservation', 400));
  }

  const bed = await Bed.findById(req.params.id);

  if (!bed) {
    return next(new ErrorResponse(`Bed not found with id of ${req.params.id}`, 404));
  }

  // Check if bed is available
  if (bed.status !== 'Available') {
    return next(new ErrorResponse(`Bed is not available for reservation`, 400));
  }

  // Update bed with reservation info
  bed.status = 'Reserved';
  bed.reservedFor = {
    name,
    admissionTime: admissionTime || new Date()
  };
  bed.reservationTime = new Date();
  bed.updatedBy = req.user.id;
  bed.updatedAt = Date.now();

  await bed.save();

  res.status(200).json({
    success: true,
    data: bed
  });
});

// @desc    Upload Excel file to update beds
// @route   POST /api/beds/upload
// @access  Private/Admin/Manager
exports.uploadBedExcel = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an Excel file', 400));
  }

  // Process Excel file
  try {
    // Parse Excel file buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    
    // Get first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const bedsData = XLSX.utils.sheet_to_json(worksheet);
    
    if (!bedsData || bedsData.length === 0) {
      return next(new ErrorResponse('The Excel file contains no data', 400));
    }

    // Process records and update database
    const results = {
      totalProcessed: bedsData.length,
      updated: 0,
      created: 0,
      errors: 0,
      errorDetails: []
    };

    // Process each record
    for (const bedData of bedsData) {
      try {
        // Validate required fields
        if (!bedData.bedId) {
          throw new Error(`Row missing required bedId field`);
        }

        // Find the bed by bedId (not MongoDB _id)
        let bed = await Bed.findOne({ bedId: bedData.bedId });
        
        // If bed doesn't exist, create a new one
        if (!bed) {
          // Create a new bed
          const newBedData = {
            bedId: bedData.bedId,
            status: bedData.status || 'Available',
            ward: bedData.ward,
            type: bedData.type || 'Standard',
            location: {
              building: bedData['location.building'] || '',
              floor: bedData['location.floor'] || '',
              roomNumber: bedData['location.roomNumber']
            },
            lastSanitized: bedData.lastSanitized ? new Date(bedData.lastSanitized) : new Date(),
            notes: bedData.notes,
            createdBy: req.user.id,
            updatedBy: req.user.id
          };
          
          // Validate required fields for new bed
          if (!newBedData.ward || !newBedData.location.roomNumber) {
            throw new Error(`New bed ${bedData.bedId} missing required fields: ward and/or location.roomNumber`);
          }
          
          try {
            bed = await Bed.create(newBedData);
            results.created++;
            continue; // Skip to next bed since we've just created this one
          } catch (createError) {
            throw new Error(`Failed to create new bed ${bedData.bedId}: ${createError.message}`);
          }
        }

        // Prepare location data if any location fields are provided
        const locationUpdates = {};
        if (bedData['location.building'] !== undefined) locationUpdates.building = bedData['location.building'];
        if (bedData['location.floor'] !== undefined) locationUpdates.floor = bedData['location.floor'];
        if (bedData['location.roomNumber'] !== undefined) locationUpdates.roomNumber = bedData['location.roomNumber'];
        
        // Handle status changes and currentPatient updates
        if (bedData.status) {
          // If status changes from Occupied to something else, update the patient record
          if (bed.status === 'Occupied' && bedData.status !== 'Occupied') {
            // If currently occupied, remove the patient association
            if (bed.currentPatient && bed.currentPatient.patientId) {
              const patient = await Patient.findById(bed.currentPatient.patientId);
              if (patient) {
                patient.assignedBed = null;
                patient.updatedBy = req.user.id;
                patient.updatedAt = Date.now();
                await patient.save();
              }
            }
            
            // Clear current patient data
            bed.currentPatient = null;
          }
          
          // If status changes to Occupied, need to associate with a patient
          if (bedData.status === 'Occupied' && bedData['currentPatient.patientId']) {
            // Validate patient exists
            const patientId = bedData['currentPatient.patientId'];
            let patientIdObj;
            
            // Convert string ID to ObjectId if needed
            try {
              patientIdObj = new mongoose.Types.ObjectId(patientId);
            } catch (err) {
              throw new Error(`Invalid patient ID format for bed ${bedData.bedId}`);
            }
            
            const patient = await Patient.findById(patientIdObj);
            
            if (!patient) {
              throw new Error(`Patient with ID ${patientId} not found for bed ${bedData.bedId}`);
            }
            
            // Check if patient already has a bed
            if (patient.assignedBed && !patient.assignedBed.equals(bed._id)) {
              throw new Error(`Patient ${patientId} already assigned to another bed`);
            }
            
            // Update patient record
            patient.assignedBed = bed._id;
            patient.updatedBy = req.user.id;
            patient.updatedAt = Date.now();
            await patient.save();
            
            // Update bed with patient data
            bed.currentPatient = {
              patientId: patient._id,
              name: patient.name,
              age: patient.age,
              gender: patient.gender,
              diagnosis: patient.diagnosis,
              admissionDate: patient.admissionDate,
              expectedDischarge: patient.dischargeDate
            };
          }
          
          // If changing to Reserved status
          if (bedData.status === 'Reserved' && bedData.reservedFor) {
            bed.reservedFor = {
              name: bedData.reservedFor,
              admissionTime: bedData.reservationTime ? new Date(bedData.reservationTime) : new Date()
            };
            bed.reservationTime = new Date();
          }
          
          // If moving from Reserved to another status, clear reservation data
          if (bed.status === 'Reserved' && bedData.status !== 'Reserved') {
            bed.reservedFor = null;
            bed.reservationTime = null;
          }
          
          // Update basic bed status
          bed.status = bedData.status;
        }
        
        // Update other basic bed fields if provided
        if (bedData.ward) bed.ward = bedData.ward;
        if (bedData.type) bed.type = bedData.type;
        if (bedData.lastSanitized) bed.lastSanitized = new Date(bedData.lastSanitized);
        if (bedData.notes) bed.notes = bedData.notes;
        
        // Update location if we have any location updates
        if (Object.keys(locationUpdates).length > 0) {
          bed.location = {
            ...bed.location.toObject(),
            ...locationUpdates
          };
        }
        
        // Update maintenance fields if provided
        if (bedData.maintenanceReason) bed.maintenanceReason = bedData.maintenanceReason;
        if (bedData.maintenanceEndTime) bed.maintenanceEndTime = new Date(bedData.maintenanceEndTime);
        
        // Update audit fields
        bed.updatedBy = req.user.id;
        bed.updatedAt = Date.now();
        
        // Save the updated bed
        await bed.save();
        
        results.updated++;
      } catch (error) {
        results.errors++;
        results.errorDetails.push(`Row for bed ${bedData.bedId || 'unknown'}: ${error.message}`);
      }
    }

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    return next(new ErrorResponse(`Error processing Excel file: ${error.message}`, 500));
  }
});