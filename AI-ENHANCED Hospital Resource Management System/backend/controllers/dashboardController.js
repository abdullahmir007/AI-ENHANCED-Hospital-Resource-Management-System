// File: controllers/dashboardController.js
const Bed = require('../models/Bed');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
const Equipment = require('../models/Equipment');
const Alert = require('../models/Alert');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // Compile all key statistics for dashboard overview
  
  // Get bed statistics
  const totalBeds = await Bed.countDocuments();
  const occupiedBeds = await Bed.countDocuments({ status: 'Occupied' });
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  
  // Get staff statistics
  const totalStaff = await Staff.countDocuments();
  const onDutyStaff = await Staff.countDocuments({ onDuty: true });
  const staffUtilizationRate = totalStaff > 0 ? Math.round((onDutyStaff / totalStaff) * 100) : 0;
  
  // Get patient statistics
  const totalPatients = await Patient.countDocuments();
  const inpatients = await Patient.countDocuments({ status: 'Admitted', assignedBed: { $ne: null } });
  const outpatients = await Patient.countDocuments({ status: 'Admitted', assignedBed: null });
  const dischargesToday = await Patient.countDocuments({
    dischargeDate: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999))
    }
  });
  
  // Get equipment statistics
  const totalEquipment = await Equipment.countDocuments();
  const availableEquipment = await Equipment.countDocuments({ status: 'Available' });
  const inUseEquipment = await Equipment.countDocuments({ status: 'In Use' });
  const equipmentUtilizationRate = totalEquipment > 0 ? Math.round((inUseEquipment / totalEquipment) * 100) : 0;
  
  // Get alert statistics
  const activeAlerts = await Alert.countDocuments({ status: 'Active' });
  const criticalAlerts = await Alert.countDocuments({ priority: 'Critical', status: 'Active' });
  
  // Ward-specific bed statistics
  const wardStats = await Bed.aggregate([
    {
      $group: {
        _id: '$ward',
        total: { $sum: 1 },
        occupied: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] 
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
        available: { $subtract: ['$total', '$occupied'] },
        occupancyRate: { 
          $round: [{ $multiply: [{ $divide: ['$occupied', '$total'] }, 100] }, 1] 
        }
      }
    }
  ]);
  
  // Staff distribution by department
  const staffByDepartment = await Staff.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
        onDuty: { $sum: { $cond: ['$onDuty', 1, 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        department: '$_id',
        total: '$count',
        onDuty: 1,
        offDuty: { $subtract: ['$count', '$onDuty'] }
      }
    },
    { $sort: { total: -1 } }
  ]);
  
  // Equipment status by category
  const equipmentByCategory = await Equipment.aggregate([
    {
      $group: {
        _id: '$category',
        total: { $sum: 1 },
        inUse: { $sum: { $cond: [{ $eq: ['$status', 'In Use'] }, 1, 0] } },
        available: { $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] } },
        maintenance: { $sum: { $cond: [{ $eq: ['$status', 'Maintenance'] }, 1, 0] } }
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
        utilization: { 
          $round: [{ $multiply: [{ $divide: ['$inUse', '$total'] }, 100] }, 1] 
        }
      }
    }
  ]);
  
  // Recent discharges/admissions
  const recentPatientActivity = await Patient.find()
    .sort('-updatedAt')
    .limit(5)
    .select('name status admissionDate dischargeDate diagnosis');
  
  // Compile all statistics
  const stats = {
    summary: {
      beds: {
        total: totalBeds,
        occupied: occupiedBeds,
        available: totalBeds - occupiedBeds,
        occupancyRate: bedOccupancyRate
      },
      staff: {
        total: totalStaff,
        onDuty: onDutyStaff,
        offDuty: totalStaff - onDutyStaff,
        utilizationRate: staffUtilizationRate
      },
      patients: {
        total: totalPatients,
        inpatient: inpatients,
        outpatient: outpatients,
        dischargeToday: dischargesToday
      },
      equipment: {
        total: totalEquipment,
        inUse: inUseEquipment,
        available: availableEquipment,
        utilizationRate: equipmentUtilizationRate
      },
      alerts: {
        active: activeAlerts,
        critical: criticalAlerts
      }
    },
    details: {
      bedsByWard: wardStats,
      staffByDepartment,
      equipmentByCategory,
      recentPatientActivity
    }
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get dashboard alerts
// @route   GET /api/dashboard/alerts
// @access  Private
exports.getDashboardAlerts = asyncHandler(async (req, res, next) => {
  // Get recent active alerts
  const alerts = await Alert.find({ status: 'Active' })
    .sort('-createdAt')
    .limit(5)
    .populate('createdBy', 'name');
  
  res.status(200).json({
    success: true,
    data: alerts
  });
});

// @desc    Get dashboard AI insights
// @route   GET /api/dashboard/ai-insights
// @access  Private
exports.getDashboardAIInsights = asyncHandler(async (req, res, next) => {
  // In a real application, this would pull from an AI/ML system
  // Here we'll generate some example insights
  
  // Check bed utilization
  const bedStats = await Bed.aggregate([
    {
      $group: {
        _id: '$ward',
        total: { $sum: 1 },
        occupied: { $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        ward: '$_id',
        occupancyRate: { $multiply: [{ $divide: ['$occupied', '$total'] }, 100] }
      }
    }
  ]);
  
  const highOccupancyWards = bedStats.filter(ward => ward.occupancyRate > 85);
  
  // Check staff utilization
  const staffStats = await Staff.aggregate([
    {
      $group: {
        _id: '$department',
        total: { $sum: 1 },
        onDuty: { $sum: { $cond: ['$onDuty', 1, 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        department: '$_id',
        utilizationRate: { $multiply: [{ $divide: ['$onDuty', '$total'] }, 100] }
      }
    }
  ]);
  
  const highUtilizationDepts = staffStats.filter(dept => dept.utilizationRate > 90);
  
  // Generate insights
  const insights = [];
  
  // Bed capacity insights
  if (highOccupancyWards.length > 0) {
    highOccupancyWards.forEach(ward => {
      insights.push({
        id: `bed-${ward.ward.toLowerCase()}`,
        title: `${ward.ward} Bed Capacity Alert`,
        description: `${ward.ward} ward is at ${ward.occupancyRate.toFixed(1)}% capacity. Consider reallocating resources.`,
        type: 'alert',
        priority: ward.occupancyRate > 95 ? 'high' : 'medium',
        timestamp: new Date()
      });
    });
  }
  
  // Staff utilization insights
  if (highUtilizationDepts.length > 0) {
    highUtilizationDepts.forEach(dept => {
      insights.push({
        id: `staff-${dept.department.toLowerCase()}`,
        title: `${dept.department} Staff Utilization Concern`,
        description: `${dept.department} department has ${dept.utilizationRate.toFixed(1)}% staff utilization. Risk of burnout.`,
        type: 'alert',
        priority: dept.utilizationRate > 95 ? 'high' : 'medium',
        timestamp: new Date()
      });
    });
  }
  
  // Add some example insights if we don't have enough
  if (insights.length < 3) {
    insights.push({
      id: 'efficiency-1',
      title: 'Scheduling Efficiency Opportunity',
      description: 'Optimizing staff schedules in General Ward could reduce overtime by 15% based on historical patterns.',
      type: 'efficiency',
      priority: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3)
    });
    
    insights.push({
      id: 'prediction-1',
      title: 'Patient Admission Forecast',
      description: 'Predicted 22% increase in ER admissions over the next 48 hours based on seasonal trends.',
      type: 'suggestion',
      priority: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    });
  }
  
  res.status(200).json({
    success: true,
    data: insights
  });
});