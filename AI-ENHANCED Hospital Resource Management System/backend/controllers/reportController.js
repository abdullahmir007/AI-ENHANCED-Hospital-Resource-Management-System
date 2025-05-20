// File: controllers/reportController.js
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Bed = require('../models/Bed');
const Staff = require('../models/Staff'); // Import the Staff model

// @desc    Get operational reports summary
// @route   GET /api/reports/operational
// @access  Private
exports.getOperationalReports = asyncHandler(async (req, res, next) => {
  const dateRange = req.query.dateRange || 'week';
  
  // Get all beds from the database for real-time calculations
  const beds = await Bed.find();
  
  if (!beds || beds.length === 0) {
    return next(new ErrorResponse('No bed data found', 404));
  }
  
  // Calculate bed occupancy metrics
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(bed => bed.status === 'Occupied').length;
  const averageOccupancy = Math.round((occupiedBeds / totalBeds) * 100);
  const peakOccupancy = Math.round(((occupiedBeds + beds.filter(bed => bed.status === 'Reserved').length) / totalBeds) * 100);
  const turnoverRate = 3.5; // Would need historical data for accuracy
  
  // Get staff utilization data from real-time data
  const staffMembers = await Staff.find();
  const onDutyStaff = staffMembers.filter(staff => staff.onDuty).length;
  const totalStaff = staffMembers.length;
  const staffUtilization = Math.round((onDutyStaff / totalStaff) * 100);
  
  // Calculate overtime hours
  let overtimeHours = 0;
  staffMembers.forEach(staff => {
    if (staff.performanceMetrics && staff.performanceMetrics.overtimeHours) {
      overtimeHours += staff.performanceMetrics.overtimeHours;
    } else if (staff.patientsAssigned > 5) {
      // Estimate 2 hours of overtime for staff with high patient loads
      overtimeHours += 2;
    }
  });
  
  // Calculate staff-to-patient ratio
  const totalAssignedPatients = staffMembers.reduce((sum, staff) => sum + staff.patientsAssigned, 0);
  const activeStaff = staffMembers.filter(staff => staff.onDuty).length;
  const staffToPatientRatio = activeStaff > 0 ? 
    (totalAssignedPatients / activeStaff).toFixed(1) : 0;
  
  // Get equipment usage data (using mock data for now)
  const equipmentUsageData = generateMockData('equipment-usage', dateRange);
  
  // Get department performance data (using mock data for now)
  const departmentPerformanceData = generateMockData('department-performance', dateRange);
  
  // Combine data for operational summary
  const data = {
    bedOccupancy: {
      averageOccupancy,
      peakOccupancy,
      turnoverRate
    },
    staffUtilization: {
      staffUtilization,
      overtimeHours,
      staffToPatientRatio
    },
    equipmentUsage: {
      equipmentUtilization: equipmentUsageData.equipmentUtilization,
      maintenanceEvents: equipmentUsageData.maintenanceEvents,
      downtimeHours: equipmentUsageData.downtimeHours
    },
    departmentPerformance: {
      topDepartment: departmentPerformanceData.topDepartment,
      avgResponseTime: departmentPerformanceData.avgResponseTime,
      patientThroughput: departmentPerformanceData.patientThroughput
    }
  };

  res.status(200).json({
    success: true,
    data
  });
});

// @desc    Get bed occupancy report
// @route   GET /api/reports/bed-occupancy
// @access  Private
exports.getBedOccupancyReport = asyncHandler(async (req, res, next) => {
  const dateRange = req.query.dateRange || 'week';
  
  // Get all beds from the database
  const beds = await Bed.find();
  
  if (!beds || beds.length === 0) {
    return next(new ErrorResponse('No bed data found', 404));
  }
  
  // Calculate occupancy metrics
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(bed => bed.status === 'Occupied').length;
  const reservedBeds = beds.filter(bed => bed.status === 'Reserved').length;
  const maintenanceBeds = beds.filter(bed => bed.status === 'Maintenance').length;
  const availableBeds = beds.filter(bed => bed.status === 'Available').length;
  
  // Calculate average occupancy percentage
  const averageOccupancy = Math.round((occupiedBeds / totalBeds) * 100);
  
  // Calculate peak occupancy
  // For real implementation, you would query historical data
  // This is a placeholder that estimates peak based on current + reserved
  const peakOccupancy = Math.round(((occupiedBeds + reservedBeds) / totalBeds) * 100);
  
  // Calculate turnover rate (would need admission/discharge data for accuracy)
  // Using mock value for now, could be replaced with real calculation
  const turnoverRate = 3.5;
  
  // Calculate occupancy by department
  const departments = [...new Set(beds.map(bed => bed.ward))];
  const occupancyByDepartment = departments.map(department => {
    const departmentBeds = beds.filter(bed => bed.ward === department);
    const departmentOccupied = departmentBeds.filter(bed => bed.status === 'Occupied').length;
    const occupancyRate = Math.round((departmentOccupied / departmentBeds.length) * 100);
    
    return {
      department,
      occupancy: occupancyRate
    };
  });
  
  // Calculate bed status distribution
  const bedStatusDistribution = [
    { 
      status: 'Available', 
      count: availableBeds,
      percentage: Math.round((availableBeds / totalBeds) * 100)
    },
    { 
      status: 'Occupied', 
      count: occupiedBeds,
      percentage: Math.round((occupiedBeds / totalBeds) * 100)
    },
    { 
      status: 'Reserved', 
      count: reservedBeds,
      percentage: Math.round((reservedBeds / totalBeds) * 100)
    },
    { 
      status: 'Maintenance', 
      count: maintenanceBeds,
      percentage: Math.round((maintenanceBeds / totalBeds) * 100)
    }
  ];
  
  // Calculate bed type distribution
  const bedTypes = [...new Set(beds.map(bed => bed.type).filter(type => type))]; // Filter out undefined/null
  const bedTypeDistribution = bedTypes.map(type => {
    const typeBeds = beds.filter(bed => bed.type === type);
    return {
      type,
      count: typeBeds.length,
      percentage: Math.round((typeBeds.length / totalBeds) * 100)
    };
  });
  
  // Generate occupancy trend data
  // For real implementation, you would query historical data
  // This is a placeholder that generates synthetic data
  const startDate = calculateStartDate(dateRange);
  const occupancyTrend = generateOccupancyTrend(startDate, dateRange);
  
  // Assemble the complete data object
  const data = {
    averageOccupancy,
    peakOccupancy,
    turnoverRate,
    occupancyByDepartment,
    occupancyTrend,
    bedStatusDistribution,
    bedTypeDistribution,
    totalBeds,
    occupiedBeds,
    availableBeds,
    reservedBeds,
    maintenanceBeds
  };
  
  res.status(200).json({
    success: true,
    data
  });
});

// @desc    Get staff utilization report
// @route   GET /api/reports/staff-utilization
// @access  Private
exports.getStaffUtilizationReport = asyncHandler(async (req, res, next) => {
  const dateRange = req.query.dateRange || 'week';
  
  try {
    // Get all staff from the database
    const staffMembers = await Staff.find();
    
    if (!staffMembers || staffMembers.length === 0) {
      return next(new ErrorResponse('No staff data found', 404));
    }
    
    // Calculate real-time utilization metrics

    // 1. Calculate staff utilization percentage
    const onDutyStaff = staffMembers.filter(staff => staff.onDuty).length;
    const totalStaff = staffMembers.length;
    const staffUtilization = Math.round((onDutyStaff / totalStaff) * 100);
    
    // 2. Calculate overtime hours
    // We'll calculate this based on performance metrics if available,
    // or estimate based on patientsAssigned if not
    let overtimeHours = 0;
    staffMembers.forEach(staff => {
      if (staff.performanceMetrics && staff.performanceMetrics.overtimeHours) {
        overtimeHours += staff.performanceMetrics.overtimeHours;
      } else if (staff.patientsAssigned > 5) {
        // Estimate 2 hours of overtime for staff with high patient loads
        overtimeHours += 2;
      }
    });
    
    // 3. Calculate staff-to-patient ratio
    const totalAssignedPatients = staffMembers.reduce((sum, staff) => sum + staff.patientsAssigned, 0);
    const activeStaff = staffMembers.filter(staff => staff.onDuty).length;
    const staffToPatientRatio = activeStaff > 0 ? 
      (totalAssignedPatients / activeStaff).toFixed(1) : 0;
      
    // 4. Calculate utilization by department
    // Get unique departments
    const departments = [...new Set(staffMembers.map(staff => staff.department))];
    
    const utilizationByDepartment = departments.map(department => {
      const departmentStaff = staffMembers.filter(staff => staff.department === department);
      const departmentOnDuty = departmentStaff.filter(staff => staff.onDuty).length;
      const utilization = departmentStaff.length > 0 ? 
        Math.round((departmentOnDuty / departmentStaff.length) * 100) : 0;
      
      return {
        department,
        utilization
      };
    });
    
    // 5. Generate staffing trend
    // In a real implementation, you would query historical data from shifts or logs
    // For now, we'll generate synthetic data based on the current utilization
    const startDate = calculateStartDate(dateRange);
    const staffingTrend = generateStaffingTrend(startDate, dateRange, staffUtilization);
    
    // Assemble the complete data object
    const data = {
      staffUtilization,
      overtimeHours,
      staffToPatientRatio,
      utilizationByDepartment,
      staffingTrend
    };
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    console.error('Error in staff utilization report:', err);
    return next(new ErrorResponse('Error generating staff utilization report', 500));
  }
});

// @desc    Get equipment usage report
// @route   GET /api/reports/equipment-usage
// @access  Private
exports.getEquipmentUsageReport = asyncHandler(async (req, res, next) => {
  const dateRange = req.query.dateRange || 'week';
  const data = generateMockData('equipment-usage', dateRange);

  res.status(200).json({
    success: true,
    data
  });
});

// @desc    Get department performance report
// @route   GET /api/reports/department-performance
// @access  Private
exports.getDepartmentPerformanceReport = asyncHandler(async (req, res, next) => {
  const dateRange = req.query.dateRange || 'week';
  const data = generateMockData('department-performance', dateRange);

  res.status(200).json({
    success: true,
    data
  });
});

// @desc    Export report as PDF or Excel
// @route   GET /api/reports/export/:reportType
// @access  Private
exports.exportReport = asyncHandler(async (req, res, next) => {
  const { reportType } = req.params;
  const { format = 'pdf', dateRange = 'week' } = req.query;
  
  // Get report data - using the real data functions as appropriate
  let data;
  
  switch (reportType) {
    case 'bed-occupancy':
      // Use the calculation method we created for real-time data
      const beds = await Bed.find();
      if (!beds || beds.length === 0) {
        return next(new ErrorResponse('No bed data found', 404));
      }
      
      const totalBeds = beds.length;
      const occupiedBeds = beds.filter(bed => bed.status === 'Occupied').length;
      const reservedBeds = beds.filter(bed => bed.status === 'Reserved').length;
      const maintenanceBeds = beds.filter(bed => bed.status === 'Maintenance').length;
      const availableBeds = beds.filter(bed => bed.status === 'Available').length;
      
      const averageOccupancy = Math.round((occupiedBeds / totalBeds) * 100);
      const peakOccupancy = Math.round(((occupiedBeds + reservedBeds) / totalBeds) * 100);
      const turnoverRate = 3.5; // Would need historical data for accuracy
      
      const departments = [...new Set(beds.map(bed => bed.ward))];
      const occupancyByDepartment = departments.map(department => {
        const departmentBeds = beds.filter(bed => bed.ward === department);
        const departmentOccupied = departmentBeds.filter(bed => bed.status === 'Occupied').length;
        const occupancyRate = Math.round((departmentOccupied / departmentBeds.length) * 100);
        
        return {
          department,
          occupancy: occupancyRate
        };
      });
      
      const bedStatusDistribution = [
        { 
          status: 'Available', 
          count: availableBeds,
          percentage: Math.round((availableBeds / totalBeds) * 100)
        },
        { 
          status: 'Occupied', 
          count: occupiedBeds,
          percentage: Math.round((occupiedBeds / totalBeds) * 100)
        },
        { 
          status: 'Reserved', 
          count: reservedBeds,
          percentage: Math.round((reservedBeds / totalBeds) * 100)
        },
        { 
          status: 'Maintenance', 
          count: maintenanceBeds,
          percentage: Math.round((maintenanceBeds / totalBeds) * 100)
        }
      ];
      
      const bedTypes = [...new Set(beds.map(bed => bed.type).filter(type => type))];
      const bedTypeDistribution = bedTypes.map(type => {
        const typeBeds = beds.filter(bed => bed.type === type);
        return {
          type,
          count: typeBeds.length,
          percentage: Math.round((typeBeds.length / totalBeds) * 100)
        };
      });
      
      // Generate trend data (would use real historical data in production)
      const startDate = calculateStartDate(dateRange);
      const occupancyTrend = generateOccupancyTrend(startDate, dateRange);
      
      data = {
        averageOccupancy,
        peakOccupancy,
        turnoverRate,
        occupancyByDepartment,
        occupancyTrend,
        bedStatusDistribution,
        bedTypeDistribution,
        totalBeds,
        occupiedBeds,
        availableBeds,
        reservedBeds,
        maintenanceBeds
      };
      break;
    
    case 'staff-utilization':
      // Get real staff data
      const staffMembers = await Staff.find();
      if (!staffMembers || staffMembers.length === 0) {
        return next(new ErrorResponse('No staff data found', 404));
      }
      
      // Calculate staff utilization metrics
      const onDutyStaff = staffMembers.filter(staff => staff.onDuty).length;
      const totalStaff = staffMembers.length;
      const staffUtilization = Math.round((onDutyStaff / totalStaff) * 100);
      
      // Calculate overtime hours
      let overtimeHours = 0;
      staffMembers.forEach(staff => {
        if (staff.performanceMetrics && staff.performanceMetrics.overtimeHours) {
          overtimeHours += staff.performanceMetrics.overtimeHours;
        } else if (staff.patientsAssigned > 5) {
          // Estimate overtime for staff with high patient loads
          overtimeHours += 2;
        }
      });
      
      // Calculate staff-to-patient ratio
      const totalAssignedPatients = staffMembers.reduce((sum, staff) => sum + staff.patientsAssigned, 0);
      const activeStaff = staffMembers.filter(staff => staff.onDuty).length;
      const staffToPatientRatio = activeStaff > 0 ? 
        (totalAssignedPatients / activeStaff).toFixed(1) : 0;
        
      // Calculate utilization by department
      const staffDepartments = [...new Set(staffMembers.map(staff => staff.department))];
      
      const utilizationByDepartment = staffDepartments.map(department => {
        const departmentStaff = staffMembers.filter(staff => staff.department === department);
        const departmentOnDuty = departmentStaff.filter(staff => staff.onDuty).length;
        const utilization = departmentStaff.length > 0 ? 
          Math.round((departmentOnDuty / departmentStaff.length) * 100) : 0;
        
        return {
          department,
          utilization
        };
      });
      
      // Generate staffing trend
      const staffStartDate = calculateStartDate(dateRange);
      const staffingTrend = generateStaffingTrend(staffStartDate, dateRange, staffUtilization);
      
      data = {
        staffUtilization,
        overtimeHours,
        staffToPatientRatio,
        utilizationByDepartment,
        staffingTrend
      };
      break;
      
    case 'equipment-usage':
    case 'department-performance':
      // For demo purposes, use the mock data generator
      data = generateMockData(reportType, dateRange);
      break;
      
    default:
      return next(new ErrorResponse(`No data found for report type ${reportType}`, 404));
  }
  
  if (!data || Object.keys(data).length === 0) {
    return next(new ErrorResponse(`No data found for report type ${reportType}`, 404));
  }
  
  // Enhanced PDF export function for reportController.js

// The key part you need to modify is the PDF generation in the exportReport function
// Replace the existing PDF generation code with this enhanced version:

// Fixed PDF export function for reportController.js
// This is a simpler version that should work with your existing setup

if (format === 'pdf') {
  // Generate PDF file
  const doc = new PDFDocument();
  const fileName = `${reportType}-report-${dateRange}.pdf`;
  
  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  
  // Pipe the PDF document to the response
  doc.pipe(res);
  
  // Add content to the PDF based on report type
  doc.fontSize(25).fillColor('#0047AB').text(`${reportType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Report`, {
    align: 'center'
  });
  
  doc.moveDown();
  doc.fontSize(12).fillColor('#555555').text(`Date Range: ${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}`, {
    align: 'center'
  });
  
  doc.moveDown();
  doc.fillColor('#000000');
  
  // Format PDF content based on report type
  switch (reportType) {
    case 'bed-occupancy':
      // Add summary section
      doc.fontSize(16).text('Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Average Occupancy: ${data.averageOccupancy}%`);
      doc.fontSize(12).text(`Peak Occupancy: ${data.peakOccupancy}%`);
      doc.fontSize(12).text(`Turnover Rate: ${data.turnoverRate} days`);
      doc.fontSize(12).text(`Total Beds: ${data.totalBeds}`);
      doc.fontSize(12).text(`Occupied Beds: ${data.occupiedBeds}`);
      doc.fontSize(12).text(`Available Beds: ${data.availableBeds}`);
      doc.fontSize(12).text(`Reserved Beds: ${data.reservedBeds}`);
      doc.fontSize(12).text(`Maintenance Beds: ${data.maintenanceBeds}`);
      
      doc.moveDown();
      doc.fontSize(16).text('Occupancy by Department', { underline: true });
      doc.moveDown();
      
      data.occupancyByDepartment.forEach(dept => {
        doc.fontSize(12).text(`${dept.department}: ${dept.occupancy}%`);
      });
      
      doc.moveDown();
      doc.fontSize(16).text('Bed Status Distribution', { underline: true });
      doc.moveDown();
      
      data.bedStatusDistribution.forEach(status => {
        doc.fontSize(12).text(`${status.status}: ${status.count} Beds (${status.percentage}%)`);
      });
      
      doc.moveDown();
      doc.fontSize(16).text('Bed Type Distribution', { underline: true });
      doc.moveDown();
      
      data.bedTypeDistribution.forEach(type => {
        doc.fontSize(12).text(`${type.type}: ${type.count} Beds (${type.percentage}%)`);
      });
      
      doc.moveDown();
      doc.fontSize(16).text('Occupancy Trend', { underline: true });
      doc.moveDown();
      
      doc.fontSize(12).text('Date       Occupancy');
      data.occupancyTrend.forEach(item => {
        doc.fontSize(12).text(`${item.date}: ${item.occupancy}%`);
      });
      
      doc.moveDown();
      doc.fontSize(16).text('Recommendations', { underline: true });
      doc.moveDown();
      
      if (data.averageOccupancy > 80) {
        doc.fontSize(12).text(`• Hospital is experiencing high bed occupancy (${data.averageOccupancy}%). Consider activating surge protocols.`);
      }
      
      const highOccupancyDepts = data.occupancyByDepartment.filter(dept => dept.occupancy > 85);
      if (highOccupancyDepts.length > 0) {
        doc.fontSize(12).text(`• ${highOccupancyDepts.map(dept => dept.department).join(', ')} ${highOccupancyDepts.length === 1 ? 'is' : 'are'} approaching capacity.`);
      }
      
      if (data.maintenanceBeds > 5) {
        doc.fontSize(12).text(`• Accelerate maintenance for ${data.maintenanceBeds} Beds currently unavailable.`);
      }
      
      if (data.turnoverRate > 3) {
        doc.fontSize(12).text(`• Implement improved discharge protocols to reduce turnover rate.`);
      }
      
      doc.fontSize(12).text(`• Consider scheduling bed sanitization during off-peak hours.`);
      break;
    
    case 'equipment-usage':
      doc.fontSize(16).text('Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Equipment Utilization: ${data.equipmentUtilization}%`);
      doc.fontSize(12).text(`Maintenance Events: ${data.maintenanceEvents}`);
      doc.fontSize(12).text(`Downtime Hours: ${data.downtimeHours} hrs`);
      
      doc.moveDown();
      doc.fontSize(16).text('Utilization by Category', { underline: true });
      doc.moveDown();
      
      data.utilizationByCategory.forEach(cat => {
        doc.fontSize(12).text(`${cat.category}: ${cat.utilization}%`);
      });
      
      doc.moveDown();
      doc.fontSize(16).text('Usage Trend', { underline: true });
      doc.moveDown();
      
      doc.fontSize(12).text('Date       Utilization');
      data.equipmentTrend.forEach(item => {
        doc.fontSize(12).text(`${item.date}: ${item.utilization}%`);
      });
      break;
      
    case 'staff-utilization':
      doc.fontSize(16).text('Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Staff Utilization: ${data.staffUtilization}%`);
      doc.fontSize(12).text(`Overtime Hours: ${data.overtimeHours} hrs`);
      doc.fontSize(12).text(`Staff-to-Patient Ratio: 1:${data.staffToPatientRatio}`);
      
      doc.moveDown();
      doc.fontSize(16).text('Utilization by Department', { underline: true });
      doc.moveDown();
      
      data.utilizationByDepartment.forEach(dept => {
        doc.fontSize(12).text(`${dept.department}: ${dept.utilization}%`);
      });
      break;
      
    case 'department-performance':
      doc.fontSize(16).text('Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Top Department: ${data.topDepartment}`);
      doc.fontSize(12).text(`Average Response Time: ${data.avgResponseTime} min`);
      doc.fontSize(12).text(`Patient Throughput: ${data.patientThroughput}/day`);
      
      doc.moveDown();
      doc.fontSize(16).text('Department Performance', { underline: true });
      doc.moveDown();
      
      data.departmentPerformance.forEach(dept => {
        doc.fontSize(12).text(`${dept.department}: ${dept.performance}%`);
      });
      break;
      
    default:
      doc.fontSize(12).text('No specific format available for this report type.');
  }
  
  // Finalize PDF
  doc.end();

  
  } else if (format === 'excel') {
    // Generate Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${reportType} Report`);
    const fileName = `${reportType}-report-${dateRange}.xlsx`;
    
    // Add header row with styling
    worksheet.addRow([`${reportType.replace(/-/g, ' ')} Report - ${dateRange}`]);
    worksheet.mergeCells('A1:C1');
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    worksheet.addRow([]);  // Empty row for spacing
    
    // Format Excel content based on report type
    switch (reportType) {
      case 'bed-occupancy':
        // Add summary section
        worksheet.addRow(['Summary']);
        worksheet.getCell('A3').font = { bold: true, size: 14 };
        
        worksheet.addRow(['Average Occupancy', `${data.averageOccupancy}%`]);
        worksheet.addRow(['Peak Occupancy', `${data.peakOccupancy}%`]);
        worksheet.addRow(['Turnover Rate', `${data.turnoverRate} days`]);
        worksheet.addRow(['Total Beds', data.totalBeds]);
        worksheet.addRow(['Occupied Beds', data.occupiedBeds]);
        worksheet.addRow(['Available Beds', data.availableBeds]);
        worksheet.addRow(['Reserved Beds', data.reservedBeds]);
        worksheet.addRow(['Maintenance Beds', data.maintenanceBeds]);
        
        worksheet.addRow([]);  // Empty row for spacing
        
        // Add department section
        worksheet.addRow(['Occupancy by Department']);
        worksheet.getCell('A13').font = { bold: true, size: 14 };
        
        worksheet.addRow(['Department', 'Occupancy Rate']);
        worksheet.getCell('A14').font = { bold: true };
        worksheet.getCell('B14').font = { bold: true };
        
        data.occupancyByDepartment.forEach((dept) => {
          worksheet.addRow([dept.department, `${dept.occupancy}%`]);
        });
        
        worksheet.addRow([]);  // Empty row for spacing
        
        // Add bed status distribution section
// Continuing the previous code...

        // Add bed status distribution section
        const statusRowIndex = 15 + data.occupancyByDepartment.length;
        worksheet.addRow(['Bed Status Distribution']);
        worksheet.getCell(`A${statusRowIndex}`).font = { bold: true, size: 14 };
        
        worksheet.addRow(['Status', 'Count', 'Percentage']);
        worksheet.getCell(`A${statusRowIndex + 1}`).font = { bold: true };
        worksheet.getCell(`B${statusRowIndex + 1}`).font = { bold: true };
        worksheet.getCell(`C${statusRowIndex + 1}`).font = { bold: true };
        
        data.bedStatusDistribution.forEach((status) => {
          worksheet.addRow([status.status, status.count, `${status.percentage}%`]);
        });
        
        worksheet.addRow([]);  // Empty row for spacing
        
        // Add bed type distribution section
        const typeRowIndex = statusRowIndex + data.bedStatusDistribution.length + 3;
        worksheet.addRow(['Bed Type Distribution']);
        worksheet.getCell(`A${typeRowIndex}`).font = { bold: true, size: 14 };
        
        worksheet.addRow(['Type', 'Count', 'Percentage']);
        worksheet.getCell(`A${typeRowIndex + 1}`).font = { bold: true };
        worksheet.getCell(`B${typeRowIndex + 1}`).font = { bold: true };
        worksheet.getCell(`C${typeRowIndex + 1}`).font = { bold: true };
        
        data.bedTypeDistribution.forEach((type) => {
          worksheet.addRow([type.type, type.count, `${type.percentage}%`]);
        });
        
        worksheet.addRow([]);  // Empty row for spacing
        
        // Add trend data
        const trendRowIndex = typeRowIndex + data.bedTypeDistribution.length + 3;
        worksheet.addRow(['Occupancy Trend']);
        worksheet.getCell(`A${trendRowIndex}`).font = { bold: true, size: 14 };
        
        worksheet.addRow(['Date', 'Occupancy Rate']);
        worksheet.getCell(`A${trendRowIndex + 1}`).font = { bold: true };
        worksheet.getCell(`B${trendRowIndex + 1}`).font = { bold: true };
        
        data.occupancyTrend.forEach((item) => {
          worksheet.addRow([item.date, `${item.occupancy}%`]);
        });
        
        // Add recommendations
        const recoRowIndex = trendRowIndex + data.occupancyTrend.length + 3;
        worksheet.addRow(['Recommendations']);
        worksheet.getCell(`A${recoRowIndex}`).font = { bold: true, size: 14 };
        
        let recoIndex = recoRowIndex + 1;
        
        if (data.averageOccupancy > 80) {
          worksheet.addRow([`Hospital is experiencing high bed occupancy (${data.averageOccupancy}%). Consider activating surge protocols.`]);
          recoIndex++;
        }
        
        const highOccupancyDepts = data.occupancyByDepartment.filter(dept => dept.occupancy > 85);
        if (highOccupancyDepts.length > 0) {
          worksheet.addRow([`${highOccupancyDepts.map(dept => dept.department).join(', ')} ${highOccupancyDepts.length === 1 ? 'is' : 'are'} approaching capacity.`]);
          recoIndex++;
        }
        
        if (data.maintenanceBeds > 5) {
          worksheet.addRow([`Accelerate maintenance for ${data.maintenanceBeds} beds currently unavailable.`]);
          recoIndex++;
        }
        
        if (data.turnoverRate > 3) {
          worksheet.addRow([`Implement improved discharge protocols to reduce turnover rate.`]);
          recoIndex++;
        }
        
        worksheet.addRow([`Consider scheduling bed sanitization during off-peak hours.`]);
        break;
      
      case 'staff-utilization':
        // Add summary section
        worksheet.addRow(['Summary']);
        worksheet.getCell('A3').font = { bold: true, size: 14 };
        
        worksheet.addRow(['Staff Utilization', `${data.staffUtilization}%`]);
        worksheet.addRow(['Overtime Hours', `${data.overtimeHours} hrs`]);
        worksheet.addRow(['Staff-to-Patient Ratio', `1:${data.staffToPatientRatio}`]);
        
        worksheet.addRow([]);  // Empty row for spacing
        
        // Add department section
        worksheet.addRow(['Utilization by Department']);
        worksheet.getCell('A8').font = { bold: true, size: 14 };
        
        worksheet.addRow(['Department', 'Utilization Rate']);
        worksheet.getCell('A9').font = { bold: true };
        worksheet.getCell('B9').font = { bold: true };
        
        data.utilizationByDepartment.forEach((dept) => {
          worksheet.addRow([dept.department, `${dept.utilization}%`]);
        });
        
        worksheet.addRow([]);  // Empty row for spacing
        
        // Add staffing trend
        const staffTrendRowIndex = 11 + data.utilizationByDepartment.length;
        worksheet.addRow(['Staff Utilization Trend']);
        worksheet.getCell(`A${staffTrendRowIndex}`).font = { bold: true, size: 14 };
        
        worksheet.addRow(['Date', 'Utilization Rate']);
        worksheet.getCell(`A${staffTrendRowIndex + 1}`).font = { bold: true };
        worksheet.getCell(`B${staffTrendRowIndex + 1}`).font = { bold: true };
        
        data.staffingTrend.forEach((item) => {
          worksheet.addRow([item.date, `${item.utilization}%`]);
        });
        
        // Add recommendations
        const staffRecoRowIndex = staffTrendRowIndex + data.staffingTrend.length + 3;
        worksheet.addRow(['Recommendations']);
        worksheet.getCell(`A${staffRecoRowIndex}`).font = { bold: true, size: 14 };
        
        // Generate recommendations based on actual data
        let staffRecoIndex = staffRecoRowIndex + 1;
        
        const highUtilizationDepts = data.utilizationByDepartment.filter(dept => dept.utilization > 85);
        const lowUtilizationDepts = data.utilizationByDepartment.filter(dept => dept.utilization < 65);
        
        if (data.staffUtilization > 80) {
          worksheet.addRow([`Staff utilization is high (${data.staffUtilization}%). Consider hiring additional personnel.`]);
          staffRecoIndex++;
        }
        
        if (highUtilizationDepts.length > 0) {
          worksheet.addRow([`${highUtilizationDepts.map(dept => dept.department).join(', ')} ${highUtilizationDepts.length === 1 ? 'is' : 'are'} experiencing high workload.`]);
          staffRecoIndex++;
        }
        
        if (lowUtilizationDepts.length > 0) {
          worksheet.addRow([`${lowUtilizationDepts.map(dept => dept.department).join(', ')} ${lowUtilizationDepts.length === 1 ? 'has' : 'have'} low staff utilization.`]);
          staffRecoIndex++;
        }
        
        if (data.overtimeHours > 100) {
          worksheet.addRow([`High overtime hours (${data.overtimeHours}). Review staff scheduling and workload distribution.`]);
          staffRecoIndex++;
        }
        break;
        
      case 'equipment-usage':
        // Add summary section
        worksheet.addRow(['Summary']);
        worksheet.getCell('A3').font = { bold: true, size: 14 };
        
        worksheet.addRow(['Equipment Utilization', `${data.equipmentUtilization}%`]);
        worksheet.addRow(['Maintenance Events', data.maintenanceEvents]);
        worksheet.addRow(['Downtime Hours', `${data.downtimeHours} hrs`]);
        
        worksheet.addRow([]);  // Empty row for spacing
        
        // Add category section
        worksheet.addRow(['Utilization by Category']);
        worksheet.getCell('A8').font = { bold: true, size: 14 };
        
        worksheet.addRow(['Category', 'Utilization Rate']);
        worksheet.getCell('A9').font = { bold: true };
        worksheet.getCell('B9').font = { bold: true };
        
        data.utilizationByCategory.forEach((cat) => {
          worksheet.addRow([cat.category, `${cat.utilization}%`]);
        });
        
        worksheet.addRow([]);  // Empty row for spacing
        
        // Add trend data
        const equipmentTrendRow = 11 + data.utilizationByCategory.length;
        worksheet.addRow(['Equipment Utilization Trend']);
        worksheet.getCell(`A${equipmentTrendRow}`).font = { bold: true, size: 14 };
        
        worksheet.addRow(['Date', 'Utilization Rate']);
        worksheet.getCell(`A${equipmentTrendRow + 1}`).font = { bold: true };
        worksheet.getCell(`B${equipmentTrendRow + 1}`).font = { bold: true };
        
        data.equipmentTrend.forEach((item) => {
          worksheet.addRow([item.date, `${item.utilization}%`]);
        });
        break;
        
      case 'department-performance':
        // Add summary section
        worksheet.addRow(['Summary']);
        worksheet.getCell('A3').font = { bold: true, size: 14 };
        
        worksheet.addRow(['Top Department', data.topDepartment]);
        worksheet.addRow(['Avg. Response Time', `${data.avgResponseTime} min`]);
        worksheet.addRow(['Patient Throughput', `${data.patientThroughput}/day`]);
        
        worksheet.addRow([]);  // Empty row for spacing
        
        // Add performance section
        worksheet.addRow(['Department Performance']);
        worksheet.getCell('A8').font = { bold: true, size: 14 };
        
        worksheet.addRow(['Department', 'Performance Score', 'Response Time (min)']);
        worksheet.getCell('A9').font = { bold: true };
        worksheet.getCell('B9').font = { bold: true };
        worksheet.getCell('C9').font = { bold: true };
        
        data.departmentPerformance.forEach((dept) => {
          const responseTime = data.responseTimes.find(rt => rt.department === dept.department)?.time || '-';
          worksheet.addRow([dept.department, `${dept.performance}%`, responseTime]);
        });
        break;
        
      default:
        worksheet.addRow(['No specific format available for this report type.']);
    }
    
    // Set column widths
    worksheet.columns.forEach(column => {
      column.width = 20;
    });
    
    // Set response headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } else {
    return next(new ErrorResponse(`Unsupported format: ${format}`, 400));
  }
});

// Helper function to calculate start date based on date range
function calculateStartDate(dateRange) {
  const now = new Date();
  let startDate = new Date();
  
  switch (dateRange) {
    case 'day':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7); // Default to week
  }
  
  return startDate;
}

// Helper function to generate occupancy trend data
// In a real implementation, this would be replaced with actual historical data
function generateOccupancyTrend(startDate, dateRange) {
  const trend = [];
  const numDays = dateRange === 'day' ? 24 : // Hours for a day
               dateRange === 'week' ? 7 :  // Days for a week
               dateRange === 'month' ? 30 : // Days for a month
               dateRange === 'quarter' ? 12 : // Weeks for a quarter
               dateRange === 'year' ? 12 : 7; // Months for a year, default to week
               
  const increment = dateRange === 'day' ? 'hours' :
                  dateRange === 'week' ? 'days' :
                  dateRange === 'month' ? 'days' :
                  dateRange === 'quarter' ? 'weeks' :
                  dateRange === 'year' ? 'months' : 'days';
                  
  const baseOccupancy = 75; // Starting point
  const variance = 12; // Max variation
  
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    
    if (increment === 'hours') {
      date.setHours(date.getHours() + i);
    } else if (increment === 'days') {
      date.setDate(date.getDate() + i);
    } else if (increment === 'weeks') {
      date.setDate(date.getDate() + (i * 7));
    } else if (increment === 'months') {
      date.setMonth(date.getMonth() + i);
    }
    
    // Generate realistic-looking occupancy data with some randomness
    const randomVariation = Math.floor(Math.random() * variance) - (variance / 2);
    const occupancy = Math.min(100, Math.max(50, baseOccupancy + randomVariation));
    
    trend.push({
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      occupancy
    });
  }
  
  return trend;
}

// Helper function to generate staffing trend data
function generateStaffingTrend(startDate, dateRange, baseUtilization) {
  const trend = [];
  const numDays = dateRange === 'day' ? 24 : // Hours for a day
              dateRange === 'week' ? 7 :  // Days for a week
              dateRange === 'month' ? 30 : // Days for a month
              dateRange === 'quarter' ? 12 : // Weeks for a quarter
              dateRange === 'year' ? 12 : 7; // Months for a year, default to week
              
  const increment = dateRange === 'day' ? 'hours' :
                  dateRange === 'week' ? 'days' :
                  dateRange === 'month' ? 'days' :
                  dateRange === 'quarter' ? 'weeks' :
                  dateRange === 'year' ? 'months' : 'days';
                  
  const variance = 5; // Max variation
  
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    
    if (increment === 'hours') {
      date.setHours(date.getHours() + i);
    } else if (increment === 'days') {
      date.setDate(date.getDate() + i);
    } else if (increment === 'weeks') {
      date.setDate(date.getDate() + (i * 7));
    } else if (increment === 'months') {
      date.setMonth(date.getMonth() + i);
    }
    
    // Generate realistic-looking utilization data with some randomness
    const randomVariation = Math.floor(Math.random() * variance) - (variance / 2);
    const utilization = Math.min(100, Math.max(50, baseUtilization + randomVariation));
    
    trend.push({
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      utilization
    });
  }
  
  return trend;
}

// Helper function for generating mock data for reports
// This is used for reports that don't yet have real-time data implementations
function generateMockData(reportType, dateRange) {
  switch (reportType) {
    case 'bed-occupancy':
      return {
        averageOccupancy: 82,
        peakOccupancy: 94,
        turnoverRate: 3.5,
        occupancyByDepartment: [
          { department: 'ICU', occupancy: 88 },
          { department: 'ER', occupancy: 79 },
          { department: 'General', occupancy: 75 },
          { department: 'Pediatric', occupancy: 68 },
          { department: 'Maternity', occupancy: 72 }
        ],
        occupancyTrend: [
          { date: '2025-04-14', occupancy: 80 },
          { date: '2025-04-15', occupancy: 81 },
          { date: '2025-04-16', occupancy: 83 },
          { date: '2025-04-17', occupancy: 85 },
          { date: '2025-04-18', occupancy: 87 },
          { date: '2025-04-19', occupancy: 82 },
          { date: '2025-04-20', occupancy: 82 }
        ]
      };
    case 'equipment-usage':
      return {
        equipmentUtilization: 73,
        maintenanceEvents: 24,
        downtimeHours: 38,
        utilizationByCategory: [
          { category: 'Critical', utilization: 85 },
          { category: 'Imaging', utilization: 77 },
          { category: 'Monitoring', utilization: 68 },
          { category: 'Surgical', utilization: 62 },
          { category: 'Laboratory', utilization: 70 }
        ],
        equipmentTrend: [
          { date: '2025-04-14', utilization: 72 },
          { date: '2025-04-15', utilization: 74 },
          { date: '2025-04-16', utilization: 71 },
          { date: '2025-04-17', utilization: 75 },
          { date: '2025-04-18', utilization: 73 },
          { date: '2025-04-19', utilization: 70 },
          { date: '2025-04-20', utilization: 73 }
        ]
      };
    case 'staff-utilization':
      // This is now handled by real-time data but kept as a fallback
      return {
        staffUtilization: 78,
        overtimeHours: 126,
        staffToPatientRatio: 4.2,
        utilizationByDepartment: [
          { department: 'ER', utilization: 86 },
          { department: 'ICU', utilization: 82 },
          { department: 'General Ward', utilization: 73 },
          { department: 'Surgery', utilization: 70 },
          { department: 'Pediatrics', utilization: 65 }
        ],
        staffingTrend: [
          { date: '2025-04-14', utilization: 77 },
          { date: '2025-04-15', utilization: 76 },
          { date: '2025-04-16', utilization: 79 },
          { date: '2025-04-17', utilization: 81 },
          { date: '2025-04-18', utilization: 80 },
          { date: '2025-04-19', utilization: 78 },
          { date: '2025-04-20', utilization: 78 }
        ]
      };
    case 'department-performance':
      return {
        topDepartment: 'ER (92%)',
        avgResponseTime: 8.5,
        patientThroughput: 245,
        departmentPerformance: [
          { department: 'ER', performance: 92 },
          { department: 'ICU', performance: 88 },
          { department: 'Surgery', performance: 85 },
          { department: 'General Ward', performance: 81 },
          { department: 'Pediatrics', performance: 79 }
        ],
        responseTimes: [
          { department: 'ER', time: 6.2 },
          { department: 'ICU', time: 7.1 },
          { department: 'Surgery', time: 12.5 },
          { department: 'General Ward', time: 9.8 },
          { department: 'Pediatrics', time: 8.5 }
        ]
      };
    default:
      return {};
  }
}