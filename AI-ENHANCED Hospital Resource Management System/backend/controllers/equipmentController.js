// File: controllers/equipmentController.js
const Equipment = require('../models/Equipment');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const XLSX = require('xlsx');

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
exports.getAllEquipment = asyncHandler(async (req, res, next) => {
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
      { equipmentId: searchRegex },
      { name: searchRegex },
      { serialNumber: searchRegex }
    ];
  }

  // Filter by category
  if (reqQuery.category) {
    reqQuery.category = reqQuery.category;
  }

  // Filter by status
  if (reqQuery.status) {
    reqQuery.status = reqQuery.status;
  }

  // Create query
  let query = Equipment.find(reqQuery);

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
  const total = await Equipment.countDocuments(reqQuery);

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const equipment = await query;

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
    data: equipment
  });
});

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
exports.getEquipment = asyncHandler(async (req, res, next) => {
  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new ErrorResponse(`Equipment not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: equipment
  });
});

// @desc    Create new equipment
// @route   POST /api/equipment
// @access  Private
exports.createEquipment = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const equipment = await Equipment.create(req.body);

  res.status(201).json({
    success: true,
    data: equipment
  });
});

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private
exports.updateEquipment = asyncHandler(async (req, res, next) => {
  // Add updatedBy to req.body
  req.body.updatedBy = req.user.id;
  req.body.updatedAt = Date.now();

  let equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new ErrorResponse(`Equipment not found with id of ${req.params.id}`, 404));
  }

  equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: equipment
  });
});

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private
exports.deleteEquipment = asyncHandler(async (req, res, next) => {
  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new ErrorResponse(`Equipment not found with id of ${req.params.id}`, 404));
  }

  // Check if equipment is in use
  if (equipment.status === 'In Use') {
    return next(new ErrorResponse(`Cannot delete equipment that is in use`, 400));
  }

  await equipment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get equipment statistics
// @route   GET /api/equipment/stats
// @access  Private
exports.getEquipmentStats = asyncHandler(async (req, res, next) => {
  // Get counts by category
  const categoryStats = await Equipment.aggregate([
    {
      $group: {
        _id: '$category',
        total: { $sum: 1 },
        inUse: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'In Use'] }, 1, 0] 
          } 
        },
        available: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] 
          } 
        },
        maintenance: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'Maintenance'] }, 1, 0] 
          } 
        }
      }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        total: 1,
        inUse: 1,
        available: 1,
        maintenance: 1,
        utilizationRate: { 
          $round: [{ $multiply: [{ $divide: ['$inUse', '$total'] }, 100] }, 1] 
        }
      }
    }
  ]);

  // Convert array to object with category names as keys
  const byCategory = categoryStats.reduce((acc, stat) => {
    acc[stat.category] = stat;
    return acc;
  }, {});

  // Get overall stats
  const totalEquipment = await Equipment.countDocuments();
  const inUseEquipment = await Equipment.countDocuments({ status: 'In Use' });
  const availableEquipment = await Equipment.countDocuments({ status: 'Available' });
  const maintenanceEquipment = await Equipment.countDocuments({ status: 'Maintenance' });
  const outOfOrderEquipment = await Equipment.countDocuments({ status: 'Out of Order' });

  const stats = {
    total: totalEquipment,
    inUse: inUseEquipment,
    available: availableEquipment,
    maintenance: maintenanceEquipment,
    outOfOrder: outOfOrderEquipment,
    utilizationRate: Math.round((inUseEquipment / totalEquipment) * 100),
    byCategory
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Update equipment usage status
// @route   PUT /api/equipment/:id/usage
// @access  Private
exports.updateUsageStatus = asyncHandler(async (req, res, next) => {
  const { status, patient, department, assignedBy, notes } = req.body;

  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new ErrorResponse(`Equipment not found with id of ${req.params.id}`, 404));
  }

  // Update status
  equipment.status = status;
  equipment.updatedBy = req.user.id;
  equipment.updatedAt = Date.now();

  // If status is changing to "In Use", add a new usage log entry
  if (status === 'In Use') {
    // First, check if there's an open usage (no endDate)
    const activeUsage = equipment.usageLog.find(log => !log.endDate);

    if (!activeUsage) {
      // Add new usage log
      equipment.usageLog.push({
        startDate: new Date(),
        patient,
        department,
        assignedBy: assignedBy || req.user.name || 'Unknown'
      });
    }
  } 
  // If status is changing from "In Use" to something else, close the last usage log
  else if (equipment.status === 'In Use') {
    // Find the most recent usage log without an end date
    const activeUsage = equipment.usageLog.find(log => !log.endDate);
    
    if (activeUsage) {
      activeUsage.endDate = new Date();
      if (notes) {
        activeUsage.notes = notes;
      }
    }
  }

  await equipment.save();

  res.status(200).json({
    success: true,
    data: equipment
  });
});

// @desc    Add maintenance record
// @route   POST /api/equipment/:id/maintenance
// @access  Private
exports.addMaintenanceRecord = asyncHandler(async (req, res, next) => {
  const { date, type, technician, notes, cost } = req.body;

  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new ErrorResponse(`Equipment not found with id of ${req.params.id}`, 404));
  }

  // Add maintenance record
  equipment.maintenanceHistory.push({
    date: date || new Date(),
    type,
    technician,
    notes,
    cost: parseFloat(cost) || 0,
    completedBy: req.user.id
  });

  // Update last maintenance date
  equipment.lastMaintenance = date || new Date();
  
  // If type is preventive, schedule next maintenance
  if (type === 'Preventive') {
    // Default to 3 months from now
    const nextDate = new Date(equipment.lastMaintenance);
    nextDate.setMonth(nextDate.getMonth() + 3);
    equipment.nextMaintenance = nextDate;
  }
  
  // If equipment was in maintenance status, change to available
  if (equipment.status === 'Maintenance') {
    equipment.status = 'Available';
  }
  
  equipment.updatedBy = req.user.id;
  equipment.updatedAt = Date.now();
  
  await equipment.save();

  res.status(201).json({
    success: true,
    data: equipment
  });
});

// @desc    Get scheduled maintenance
// @route   GET /api/equipment/maintenance
// @access  Private
exports.getScheduledMaintenance = asyncHandler(async (req, res, next) => {
  const { timeframe, priority, status } = req.query;
  
  // Base query - equipment with nextMaintenance date
  let query = Equipment.find({ nextMaintenance: { $ne: null } });
  
  // Apply timeframe filter
  if (timeframe) {
    const today = new Date();
    const endDate = new Date();
    
    switch(timeframe) {
      case '7':
        endDate.setDate(today.getDate() + 7);
        break;
      case '14':
        endDate.setDate(today.getDate() + 14);
        break;
      case '30':
        endDate.setDate(today.getDate() + 30);
        break;
      case '90':
        endDate.setDate(today.getDate() + 90);
        break;
      default:
        // Default to 30 days
        endDate.setDate(today.getDate() + 30);
    }
    
    query = Equipment.find({
      nextMaintenance: { $gte: today, $lte: endDate }
    });
  }
  
  // Execute query
  const equipment = await query.select('_id equipmentId name category status condition lastMaintenance nextMaintenance location');
  
  // Transform to maintenance schedule format
  const maintenanceSchedule = equipment.map(equip => {
    // Calculate days until next maintenance
    const daysUntil = Math.ceil(
      (new Date(equip.nextMaintenance) - new Date()) / (1000 * 60 * 60 * 24)
    );
    
    // Determine priority based on days remaining and condition
    let priorityLevel = 'Low';
    if (daysUntil <= 7 || equip.condition === 'Poor') {
      priorityLevel = 'High';
    } else if (daysUntil <= 14 || equip.condition === 'Fair') {
      priorityLevel = 'Medium';
    }
    
    // Skip based on priority filter if provided
    if (priority && priority !== priorityLevel.toLowerCase()) {
      return null;
    }
    
    return {
      _id: `m${equip._id}`,
      equipmentId: equip.equipmentId,
      equipmentName: equip.name,
      maintenanceType: 'Preventive',
      scheduledDate: equip.nextMaintenance,
      assignedTo: '', // Would be populated from maintenance team assignment
      status: 'Scheduled',
      priority: priorityLevel,
      notes: `Regular maintenance for ${equip.category} equipment`,
      estimatedDuration: equip.category === 'Critical' ? 120 : 90, // Mock duration in minutes
      lastMaintenance: equip.lastMaintenance
    };
  }).filter(Boolean); // Remove null entries
  
  // Sort by date
  maintenanceSchedule.sort((a, b) => 
    new Date(a.scheduledDate) - new Date(b.scheduledDate)
  );

  res.status(200).json({
    success: true,
    count: maintenanceSchedule.length,
    data: maintenanceSchedule
  });
});

// @desc    Upload equipment data from Excel file
// @route   POST /api/equipment/upload
// @access  Private (Admin, Manager)
exports.uploadEquipmentData = asyncHandler(async (req, res, next) => {
  // Check if file was uploaded
  if (!req.file) {
    return next(new ErrorResponse('Please upload an Excel file', 400));
  }

  try {
    // Read Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (!jsonData || jsonData.length === 0) {
      return next(new ErrorResponse('The Excel file contains no data', 400));
    }
    
    // Process the data
    const results = await processEquipmentData(jsonData, req.user.id);
    
    res.status(200).json({
      success: true,
      processed: results.processed,
      created: results.created,
      updated: results.updated,
      errors: results.errors
    });
  } catch (err) {
    console.error('Error processing equipment data upload:', err);
    return next(new ErrorResponse('Error processing Excel file: ' + err.message, 500));
  }
});

// Helper function to process equipment data
const processEquipmentData = async (data, userId) => {
  let processed = 0;
  let created = 0;
  let updated = 0;
  let errors = [];
  
  // Process each row
  for (const row of data) {
    try {
      // Check for required fields
      if (!row.equipmentId) {
        errors.push(`Row ${processed + 1}: Missing Equipment ID`);
        processed++;
        continue;
      }
      
      // Format the data for MongoDB
      const equipmentData = {
        updatedBy: userId,
        updatedAt: Date.now()
      };
      
      // Map basic fields
      const standardFields = [
        'name', 'category', 'manufacturer', 'model', 'serialNumber', 
        'status', 'condition', 'description'
      ];
      
      standardFields.forEach(field => {
        if (row[field] !== undefined) {
          equipmentData[field] = row[field];
        }
      });
      
      // Handle dates
      if (row.purchaseDate) {
        // Check if it's a date number from Excel or string
        equipmentData.purchaseDate = excelDateToJSDate(row.purchaseDate);
      }
      
      if (row.warrantyExpiration) {
        equipmentData.warrantyExpiration = excelDateToJSDate(row.warrantyExpiration);
      }
      
      if (row.lastMaintenance) {
        equipmentData.lastMaintenance = excelDateToJSDate(row.lastMaintenance);
      }
      
      if (row.nextMaintenance) {
        equipmentData.nextMaintenance = excelDateToJSDate(row.nextMaintenance);
      }
      
      // Handle location (nested object)
      equipmentData.location = {};
      
      if (row['location.ward']) {
        equipmentData.location.ward = row['location.ward'];
      }
      
      if (row['location.room']) {
        equipmentData.location.room = row['location.room'];
      }
      
      if (row['location.floor']) {
        equipmentData.location.floor = row['location.floor'];
      }
      
      if (row['location.building']) {
        equipmentData.location.building = row['location.building'];
      }
      
      // Find if equipment already exists
      let equipment = await Equipment.findOne({ equipmentId: row.equipmentId });
      
      if (equipment) {
        // Update existing equipment
        equipment = await Equipment.findByIdAndUpdate(
          equipment._id,
          equipmentData,
          { new: true, runValidators: true }
        );
        
        // If updating status to "In Use" and patient/department are provided
        if (row.status === 'In Use' && (row.patient || row.department)) {
          // Check if there's an open usage record
          const hasOpenUsage = equipment.usageLog.some(log => !log.endDate);
          
          // If no open usage, create a new one
          if (!hasOpenUsage) {
            const usageData = {
              startDate: new Date(),
              assignedBy: 'System Upload'
            };
            
            if (row.patient) usageData.patient = row.patient;
            if (row.department) usageData.department = row.department;
            
            equipment.usageLog.push(usageData);
            await equipment.save();
          }
        }
        // If status changing from "In Use" to something else, close the usage log
        else if (equipment.status === 'In Use' && row.status && row.status !== 'In Use') {
          // Find the open usage record
          const activeUsage = equipment.usageLog.find(log => !log.endDate);
          
          if (activeUsage) {
            activeUsage.endDate = new Date();
            await equipment.save();
          }
        }
        
        updated++;
      } else {
        // Create new equipment
        equipmentData.equipmentId = row.equipmentId;
        equipmentData.createdBy = userId;
        
        // Ensure required fields are present
        if (!equipmentData.name) {
          errors.push(`Row ${processed + 1}: Missing Name for new equipment ${row.equipmentId}`);
          processed++;
          continue;
        }
        
        if (!equipmentData.category) {
          errors.push(`Row ${processed + 1}: Missing Category for new equipment ${row.equipmentId}`);
          processed++;
          continue;
        }
        
        if (!equipmentData.manufacturer) {
          errors.push(`Row ${processed + 1}: Missing Manufacturer for new equipment ${row.equipmentId}`);
          processed++;
          continue;
        }
        
        if (!equipmentData.model) {
          errors.push(`Row ${processed + 1}: Missing Model for new equipment ${row.equipmentId}`);
          processed++;
          continue;
        }
        
        if (!equipmentData.serialNumber) {
          errors.push(`Row ${processed + 1}: Missing Serial Number for new equipment ${row.equipmentId}`);
          processed++;
          continue;
        }
        
        if (!equipmentData.purchaseDate) {
          errors.push(`Row ${processed + 1}: Missing Purchase Date for new equipment ${row.equipmentId}`);
          processed++;
          continue;
        }
        
        if (!equipmentData.location.ward || !equipmentData.location.room) {
          errors.push(`Row ${processed + 1}: Missing Location details for new equipment ${row.equipmentId}`);
          processed++;
          continue;
        }
        
        // Create new equipment
        equipment = await Equipment.create(equipmentData);
        
        // If status is "In Use" and patient/department are provided, add usage log
        if (row.status === 'In Use' && (row.patient || row.department)) {
          const usageData = {
            startDate: new Date(),
            assignedBy: 'System Upload'
          };
          
          if (row.patient) usageData.patient = row.patient;
          if (row.department) usageData.department = row.department;
          
          equipment.usageLog.push(usageData);
          await equipment.save();
        }
        
        created++;
      }
      
      processed++;
    } catch (err) {
      console.error(`Error processing row ${processed + 1}:`, err);
      errors.push(`Row ${processed + 1}: ${err.message}`);
      processed++;
    }
  }
  
  return { processed, created, updated, errors };
};

// Helper function to convert Excel dates to JavaScript dates
const excelDateToJSDate = (excelDate) => {
  // Check if it's already a date string
  if (typeof excelDate === 'string') {
    // Try to parse the date string
    const parsedDate = new Date(excelDate);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  
  // Check if it's a number (Excel date serial)
  if (typeof excelDate === 'number') {
    // Excel dates are number of days since 1/1/1900
    // But Excel incorrectly considers 1900 as a leap year, so we need to adjust
    const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return jsDate;
  }
  
  // Return the original value if it can't be converted
  return excelDate;
};