// File: controllers/staffController.js
const Staff = require('../models/Staff');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const { paginate } = require('../utils/helpers');

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private
exports.getAllStaff = asyncHandler(async (req, res, next) => {
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
      { staffId: searchRegex },
      { name: searchRegex },
      { 'contactInfo.phone': searchRegex }
    ];
  }

  // Filter by staff type
  if (reqQuery.staffType) {
    reqQuery.staffType = reqQuery.staffType;
  }

  // Filter by department
  if (reqQuery.department) {
    reqQuery.department = reqQuery.department;
  }

  // Filter by current assignment
  if (reqQuery.assignment) {
    reqQuery.currentAssignment = reqQuery.assignment;
  }

  // Filter by onDuty status
  if (reqQuery.onDuty !== undefined) {
    reqQuery.onDuty = reqQuery.onDuty === 'true';
  }

  // Create query
  let query = Staff.find(reqQuery);

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
  const total = await Staff.countDocuments(reqQuery);

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const staff = await query;

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
    data: staff
  });
});

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  Private
exports.getStaffMember = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Private
exports.createStaffMember = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Check if a user account is needed
  if (req.body.createUserAccount) {
    const { name, email, password } = req.body;
    
    if (!email || !password) {
      return next(new ErrorResponse('Email and password are required for user account', 400));
    }
    
    // Create user account
    const user = await User.create({
      name,
      email,
      password,
      role: req.body.staffType.toLowerCase(),
      department: req.body.department
    });
    
    // Associate user ID with staff
    req.body.userId = user._id;
  }

  const staff = await Staff.create(req.body);

  res.status(201).json({
    success: true,
    data: staff
  });
});

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private
exports.updateStaffMember = asyncHandler(async (req, res, next) => {
  req.body.updatedAt = Date.now();

  let staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404));
  }

  // Update associated user if exists
  if (staff.userId && (req.body.name || req.body.contactInfo?.email)) {
    const user = await User.findById(staff.userId);
    if (user) {
      if (req.body.name) user.name = req.body.name;
      if (req.body.contactInfo?.email) user.email = req.body.contactInfo.email;
      await user.save();
    }
  }

  staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private
exports.deleteStaffMember = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404));
  }

  // Delete associated user account if it exists
  if (staff.userId) {
    await User.findByIdAndDelete(staff.userId);
  }

  await staff.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get staff stats
// @route   GET /api/staff/stats
// @access  Private
exports.getStaffStats = asyncHandler(async (req, res, next) => {
  // Get total staff count
  const total = await Staff.countDocuments();
  
  // Get count of on-duty staff
  const onDuty = await Staff.countDocuments({ onDuty: true });
  
  // Get count by staff type
  const staffTypeStats = await Staff.aggregate([
    {
      $group: {
        _id: '$staffType',
        count: { $sum: 1 }
      }
    }
  ]);

  // Convert to object
  const staffTypes = staffTypeStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  // Get count by department
  const departmentStats = await Staff.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    }
  ]);

  // Convert to object
  const departments = departmentStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  // Get average overtime hours
  const overtimeStats = await Staff.aggregate([
    {
      $group: {
        _id: null,
        averageOvertime: { $avg: '$performanceMetrics.overtimeHours' }
      }
    }
  ]);

  const averageOvertime = overtimeStats.length > 0 ? 
    parseFloat(overtimeStats[0].averageOvertime.toFixed(2)) : 0;

  // Get average hours worked
  const hoursWorkedStats = await Staff.aggregate([
    {
      $group: {
        _id: null,
        averageHoursWorked: { $avg: '$performanceMetrics.avgHoursPerShift' }
      }
    }
  ]);

  const averageHoursWorked = hoursWorkedStats.length > 0 ? 
    parseFloat(hoursWorkedStats[0].averageHoursWorked.toFixed(2)) : 0;

  // Compile stats
  const stats = {
    total,
    onDuty,
    offDuty: total - onDuty,
    staffTypes,
    departments,
    averageOvertime,
    averageHoursWorked
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get staff schedule
// @route   GET /api/staff/:id/schedule
// @access  Private
exports.getStaffSchedule = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, limit } = req.query;
  
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404));
  }

  // Filter shifts by date range if provided
  let filteredShifts = [...staff.shifts];
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    filteredShifts = staff.shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= start && shiftDate <= end;
    });
  } else if (limit) {
    // Get most recent shifts up to the limit
    filteredShifts = staff.shifts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, parseInt(limit, 10));
  }

  // Sort shifts by date
  filteredShifts.sort((a, b) => new Date(a.date) - new Date(b.date));

  res.status(200).json({
    success: true,
    count: filteredShifts.length,
    data: filteredShifts
  });
});

// @desc    Update staff schedule
// @route   PUT /api/staff/:id/schedule
// @access  Private
exports.updateStaffSchedule = asyncHandler(async (req, res, next) => {
  const { shifts } = req.body;
  
  if (!shifts || !Array.isArray(shifts)) {
    return next(new ErrorResponse('Please provide shifts data as an array', 400));
  }

  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404));
  }

  // Update or add new shifts
  for (const newShift of shifts) {
    // Ensure date is in Date format
    if (typeof newShift.date === 'string') {
      newShift.date = new Date(newShift.date);
    }
    
    // Find existing shift for the same date
    const existingShiftIndex = staff.shifts.findIndex(shift => 
      new Date(shift.date).toISOString().split('T')[0] === 
      new Date(newShift.date).toISOString().split('T')[0]
    );
    
    if (existingShiftIndex !== -1) {
      // Update existing shift
      staff.shifts[existingShiftIndex] = {
        ...staff.shifts[existingShiftIndex],
        ...newShift
      };
    } else {
      // Add new shift
      staff.shifts.push(newShift);
    }
  }

  // Update onDuty status based on today's shift
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayShift = staff.shifts.find(shift => {
    const shiftDate = new Date(shift.date);
    shiftDate.setHours(0, 0, 0, 0);
    return shiftDate.getTime() === today.getTime();
  });
  
  if (todayShift) {
    staff.onDuty = todayShift.status === 'Scheduled' || todayShift.status === 'Completed';
    staff.currentAssignment = todayShift.assignment;
  }

  staff.updatedAt = Date.now();
  await staff.save();

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Get staff performance data
// @route   GET /api/staff/:id/performance
// @access  Private
exports.getStaffPerformance = asyncHandler(async (req, res, next) => {
  const { period } = req.query;
  
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404));
  }

  // Get start date based on requested period
  let startDate = new Date();
  if (period === '7days') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === '30days') {
    startDate.setDate(startDate.getDate() - 30);
  } else if (period === '90days') {
    startDate.setDate(startDate.getDate() - 90);
  } else {
    // Default to 30 days
    startDate.setDate(startDate.getDate() - 30);
  }

  // Filter shifts by start date
  const recentShifts = staff.shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    return shiftDate >= startDate;
  });

  // Organize shifts by date for trend analysis
  const workloadTrend = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - 29 + i);
    date.setHours(0, 0, 0, 0);
    
    const shift = recentShifts.find(s => {
      const shiftDate = new Date(s.date);
      shiftDate.setHours(0, 0, 0, 0);
      return shiftDate.getTime() === date.getTime();
    });
    
    if (shift) {
      workloadTrend.push({
        date: date.toISOString().split('T')[0],
        patients: Math.random() * 10 + 2, // Mock patient data
        hours: shift.hoursWorked || 0,
        overtime: Math.max(0, (shift.hoursWorked || 0) - 8)
      });
    } else {
      workloadTrend.push({
        date: date.toISOString().split('T')[0],
        patients: 0,
        hours: 0,
        overtime: 0
      });
    }
  }

  // Calculate assignment distribution
  const assignmentDays = {};
  recentShifts.forEach(shift => {
    if (shift.assignment && shift.assignment !== 'Off') {
      assignmentDays[shift.assignment] = (assignmentDays[shift.assignment] || 0) + 1;
    }
  });

  const assignments = Object.keys(assignmentDays).map(area => ({
    area,
    days: assignmentDays[area]
  }));

  // Compile performance data
  const performance = {
    workloadTrend,
    metrics: {
      averagePatients: parseFloat((8 + Math.random() * 4).toFixed(1)), // Mock patient load
      averageHours: parseFloat((staff.performanceMetrics.avgHoursPerShift || 8.5).toFixed(1)),
      totalOvertime: staff.performanceMetrics.overtimeHours || 0,
      efficiencyScore: Math.round(70 + Math.random() * 30), // Mock efficiency score
      patientSatisfaction: staff.performanceMetrics.patientSatisfaction || 85
    },
    assignments
  };

  res.status(200).json({
    success: true,
    data: performance
  });
});

// @desc    Get optimal staffing data
// @route   GET /api/staff/optimal
// @access  Private
exports.getOptimalStaffing = asyncHandler(async (req, res, next) => {
  // This would usually have complex logic to analyze staffing patterns
  // For now, we'll return mock data similar to what the UI expects
  
  const staffData = await Staff.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    }
  ]);

  const departmentCounts = staffData.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // Mock optimal staffing data
  const optimalStaffing = {
    current: {
      staffingLevels: {
        total: await Staff.countDocuments(),
        departments: [
          { name: 'ER', total: departmentCounts['ER'] || 120, onDuty: {morning: 40, evening: 38, night: 25} },
          { name: 'ICU', total: departmentCounts['ICU'] || 95, onDuty: {morning: 30, evening: 28, night: 20} },
          { name: 'General Ward', total: departmentCounts['General Ward'] || 150, onDuty: {morning: 45, evening: 40, night: 30} },
          { name: 'Surgery', total: departmentCounts['Surgery'] || 80, onDuty: {morning: 30, evening: 25, night: 10} },
          { name: 'Pediatrics', total: departmentCounts['Pediatrics'] || 55, onDuty: {morning: 20, evening: 15, night: 10} }
        ],
        staffTypes: [
          { type: 'Surgeon', total: await Staff.countDocuments({ staffType: 'Surgeon' }) },
          { type: 'Nurse', total: await Staff.countDocuments({ staffType: 'Nurse' }) },
          { type: 'Physician', total: await Staff.countDocuments({ staffType: 'Physician' }) },
          { type: 'Technician', total: await Staff.countDocuments({ staffType: 'Technician' }) }
        ]
      },
      patientLoad: {
        total: 382,
        byDepartment: [
          { name: 'ER', patients: 95 },
          { name: 'ICU', patients: 42 },
          { name: 'General Ward', patients: 165 },
          { name: 'Surgery', patients: 35 },
          { name: 'Pediatrics', patients: 45 }
        ],
        trend: Array(7).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 6 + i);
          return {
            date: date.toISOString().split('T')[0],
            patients: 370 + Math.floor(Math.random() * 30)
          };
        })
      },
      utilization: {
        overall: 78,
        byDepartment: [
          { name: 'ER', utilization: 92, ratio: 2.4 },
          { name: 'ICU', utilization: 85, ratio: 1.4 },
          { name: 'General Ward', utilization: 75, ratio: 3.7 },
          { name: 'Surgery', utilization: 65, ratio: 1.2 },
          { name: 'Pediatrics', utilization: 70, ratio: 2.3 }
        ],
        byShift: [
          { shift: 'Morning (7AM-3PM)', utilization: 82 },
          { shift: 'Evening (3PM-11PM)', utilization: 78 },
          { shift: 'Night (11PM-7AM)', utilization: 65 }
        ]
      },
      issues: [
        { id: 1, severity: 'high', area: 'ER', issue: 'Nurse understaffing during evening shifts', impactScore: 85 },
        { id: 2, severity: 'medium', area: 'Surgery', issue: 'Surgeon overstaffing during night shifts', impactScore: 65 },
        { id: 3, severity: 'high', area: 'ICU', issue: 'High overtime hours for nurses', impactScore: 80 },
        { id: 4, severity: 'low', area: 'General Ward', issue: 'Uneven distribution of patient load', impactScore: 45 }
      ]
    },
    optimized: {
      staffingLevels: {
        departments: [
          { name: 'ER', current: departmentCounts['ER'] || 120, recommended: 135, change: '+15' },
          { name: 'ICU', current: departmentCounts['ICU'] || 95, recommended: 100, change: '+5' },
          { name: 'General Ward', current: departmentCounts['General Ward'] || 150, recommended: 140, change: '-10' },
          { name: 'Surgery', current: departmentCounts['Surgery'] || 80, recommended: 75, change: '-5' },
          { name: 'Pediatrics', current: departmentCounts['Pediatrics'] || 55, recommended: 50, change: '-5' }
        ],
        shifts: [
          { 
            area: 'ER', 
            morning: { current: 40, recommended: 42, change: '+2' },
            evening: { current: 38, recommended: 45, change: '+7' },
            night: { current: 25, recommended: 28, change: '+3' }
          },
          { 
            area: 'ICU', 
            morning: { current: 30, recommended: 32, change: '+2' },
            evening: { current: 28, recommended: 28, change: '0' },
            night: { current: 20, recommended: 22, change: '+2' }
          },
          { 
            area: 'General Ward', 
            morning: { current: 45, recommended: 45, change: '0' },
            evening: { current: 40, recommended: 38, change: '-2' },
            night: { current: 30, recommended: 27, change: '-3' }
          }
        ]
      },
      recommendations: [
        {
          id: 1,
          area: 'ER',
          recommendation: 'Increase nursing staff during evening shifts',
          impact: 'High',
          details: 'Add 7 nurses to evening shifts (3PM-11PM) in the ER to address high patient-to-nurse ratios.',
          benefits: ['Reduced wait times', 'Improved patient outcomes', 'Decreased overtime costs'],
          costsAndResources: 'Requires hiring 4 new nurses and reallocating 3 from General Ward.',
          implementationSteps: [
            'Identify nurses for reallocation from General Ward',
            'Post job listings for 4 new ER nurse positions',
            'Adjust scheduling system to reflect changes',
            'Monitor impact on patient wait times and staff satisfaction'
          ]
        },
        {
          id: 2,
          area: 'Surgery',
          recommendation: 'Reduce surgical staffing during night shifts',
          impact: 'Medium',
          details: 'Decrease night shift surgical staff by 3 surgeons and 2 technicians.',
          benefits: ['Cost savings', 'More efficient resource allocation', 'Maintain quality of care'],
          costsAndResources: 'Minimal implementation cost. Will save approximately $25,000 monthly.',
          implementationSteps: [
            'Analyze historical night shift surgical cases',
            'Identify surgical staff for reallocation',
            'Update on-call rotation to ensure emergency coverage',
            'Implement change over 2-week period'
          ]
        },
        {
          id: 3,
          area: 'ICU',
          recommendation: 'Optimize nurse scheduling to reduce overtime',
          impact: 'High',
          details: 'Implement new scheduling algorithm to balance workload and reduce nurse overtime in ICU.',
          benefits: ['Reduced staff burnout', 'Lower overtime costs', 'Improved care consistency'],
          costsAndResources: 'Will reduce overtime costs by approximately $15,000 monthly.',
          implementationSteps: [
            'Audit current overtime patterns',
            'Implement new scheduling algorithm',
            'Train shift managers on workload balancing',
            'Monitor overtime hours and staff satisfaction'
          ]
        }
      ],
      expectedOutcomes: {
        costSavings: '$45,000 monthly',
        staffUtilization: '+12%',
        patientCareMetrics: '+8%',
        staffSatisfaction: '+15%'
      }
    }
  };

  res.status(200).json({
    success: true,
    data: optimalStaffing
  });
});

// @desc    Get staff utilization data
// @route   GET /api/staff/utilization
// @access  Private
exports.getStaffUtilization = asyncHandler(async (req, res, next) => {
  // This would have complex logic to analyze utilization patterns
  // For now, we'll return mock data
  
  // Mock utilization data
  const utilization = {
    byStaffType: [
      { type: 'Nurse', utilization: 87, target: 75, headcount: await Staff.countDocuments({ staffType: 'Nurse' }) },
      { type: 'Surgeon', utilization: 68, target: 70, headcount: await Staff.countDocuments({ staffType: 'Surgeon' }) },
      { type: 'Physician', utilization: 75, target: 75, headcount: await Staff.countDocuments({ staffType: 'Physician' }) },
      { type: 'Technician', utilization: 72, target: 75, headcount: await Staff.countDocuments({ staffType: 'Technician' }) }
    ],
    byDepartment: [
      { department: 'ER', utilization: 92, target: 80, staffCount: await Staff.countDocuments({ department: 'ER' }) },
      { department: 'ICU', utilization: 85, target: 80, staffCount: await Staff.countDocuments({ department: 'ICU' }) },
      { department: 'General Ward', utilization: 75, target: 75, staffCount: await Staff.countDocuments({ department: 'General Ward' }) },
      { department: 'Surgery', utilization: 65, target: 70, staffCount: await Staff.countDocuments({ department: 'Surgery' }) },
      { department: 'Pediatrics', utilization: 70, target: 75, staffCount: await Staff.countDocuments({ department: 'Pediatrics' }) }
    ],
    timeBasedAnalysis: [
      { hour: '00:00', utilization: 65, staffCount: 120 },
      { hour: '03:00', utilization: 60, staffCount: 115 },
      { hour: '06:00', utilization: 70, staffCount: 130 },
      { hour: '09:00', utilization: 85, staffCount: 180 },
      { hour: '12:00', utilization: 90, staffCount: 190 },
      { hour: '15:00', utilization: 88, staffCount: 185 },
      { hour: '18:00', utilization: 82, staffCount: 170 },
      { hour: '21:00', utilization: 75, staffCount: 140 }
    ]
  };

  res.status(200).json({
    success: true,
    data: utilization
  });
});

// @desc    Get staff availability
// @route   GET /api/staff/availability
// @access  Private
exports.getStaffAvailability = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, staffType, department } = req.query;

  // Build filter
  const filter = {};
  if (staffType) filter.staffType = staffType;
  if (department) filter.department = department;

  // Find staff matching filter
  const staffMembers = await Staff.find(filter).select('_id name staffType department shifts');
  
  // Process start and end dates
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(start);
  end.setDate(end.getDate() + 7); // Default to one week if no end date

  // For each staff member, extract shifts within date range
  const availability = staffMembers.map(staff => {
    const filteredShifts = staff.shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= start && shiftDate <= end;
    });
    
    // Sort shifts by date
    const sortedShifts = filteredShifts.sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    return {
      staffId: staff._id,
      name: staff.name,
      staffType: staff.staffType,
      department: staff.department,
      shifts: sortedShifts
    };
  });

  res.status(200).json({
    success: true,
    count: availability.length,
    data: availability
  });
});

// @desc    Record overtime hours
// @route   POST /api/staff/:id/overtime
// @access  Private
exports.recordOvertime = asyncHandler(async (req, res, next) => {
  const { hours, date, notes } = req.body;
  
  if (!hours || hours <= 0) {
    return next(new ErrorResponse('Please provide valid overtime hours', 400));
  }

  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404));
  }

  // Update performance metrics
  staff.performanceMetrics.overtimeHours = 
    (staff.performanceMetrics.overtimeHours || 0) + parseFloat(hours);
    
  // Update shift if provided date matches a shift
  if (date) {
    const shiftDate = new Date(date);
    const shiftIndex = staff.shifts.findIndex(shift => {
      const currShiftDate = new Date(shift.date);
      return currShiftDate.toISOString().split('T')[0] === shiftDate.toISOString().split('T')[0];
    });
    
    if (shiftIndex !== -1) {
      staff.shifts[shiftIndex].hoursWorked = 
        (staff.shifts[shiftIndex].hoursWorked || 0) + parseFloat(hours);
      if (notes) {
        staff.shifts[shiftIndex].notes = 
          staff.shifts[shiftIndex].notes 
          ? `${staff.shifts[shiftIndex].notes}; ${notes}` 
          : notes;
      }
    }
  }

  staff.updatedAt = Date.now();
  await staff.save();

  res.status(200).json({
    success: true,
    data: staff
  });
});