// File: services/reportService.js
import API from './api';

/**
 * Get operational reports data
 * @param {string} dateRange - Date range for the report (day, week, month, quarter, year)
 * @returns {Promise} - Response with operational reports data
 */
export const getOperationalReports = async (dateRange = 'week') => {
  try {
    const response = await API.get('/reports/operational', { params: { dateRange } });
    return response;
  } catch (error) {
    console.error('Error fetching operational reports:', error);
    throw error;
  }
};

/**
 * Get financial reports data
 * @param {string} dateRange - Date range for the report (day, week, month, quarter, year)
 * @returns {Promise} - Response with financial reports data
 */
export const getFinancialReports = async (dateRange = 'week') => {
  try {
    const response = await API.get('/reports/financial', { params: { dateRange } });
    return response;
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    throw error;
  }
};

/**
 * Get clinical reports data
 * @param {string} dateRange - Date range for the report (day, week, month, quarter, year)
 * @returns {Promise} - Response with clinical reports data
 */
export const getClinicalReports = async (dateRange = 'week') => {
  try {
    const response = await API.get('/reports/clinical', { params: { dateRange } });
    return response;
  } catch (error) {
    console.error('Error fetching clinical reports:', error);
    throw error;
  }
};

/**
 * Get bed occupancy report data
 * @param {string} dateRange - Date range for the report
 * @returns {Promise} - Response with bed occupancy report data
 */
export const getBedOccupancyReport = async (dateRange = 'week') => {
  try {
    const response = await API.get('/reports/bed-occupancy', { params: { dateRange } });
    return response;
  } catch (error) {
    console.error('Error fetching bed occupancy report:', error);
    throw error;
  }
};

/**
 * Get staff utilization report data
 * @param {string} dateRange - Date range for the report
 * @returns {Promise} - Response with staff utilization report data
 */
export const getStaffUtilizationReport = async (dateRange = 'week') => {
  try {
    const response = await API.get('/reports/staff-utilization', { params: { dateRange } });
    return response;
  } catch (error) {
    console.error('Error fetching staff utilization report:', error);
    throw error;
  }
};

/**
 * Get equipment usage report data
 * @param {string} dateRange - Date range for the report
 * @returns {Promise} - Response with equipment usage report data
 */
export const getEquipmentUsageReport = async (dateRange = 'week') => {
  try {
    const response = await API.get('/reports/equipment-usage', { params: { dateRange } });
    return response;
  } catch (error) {
    console.error('Error fetching equipment usage report:', error);
    throw error;
  }
};

/**
 * Get department performance report data
 * @param {string} dateRange - Date range for the report
 * @returns {Promise} - Response with department performance report data
 */
export const getDepartmentPerformanceReport = async (dateRange = 'week') => {
  try {
    const response = await API.get('/reports/department-performance', { params: { dateRange } });
    return response;
  } catch (error) {
    console.error('Error fetching department performance report:', error);
    throw error;
  }
};

/**
 * Export report as PDF
 * @param {string} reportType - Type of report (bed-occupancy, staff-utilization, etc.)
 * @param {string} dateRange - Date range for the report
 * @returns {Promise} - Response with PDF download
 */
export const exportReportAsPDF = async (reportType, dateRange = 'week') => {
  try {
    // Important: Set responseType to 'blob' to handle binary data
    const response = await API.get(`/reports/export/${reportType}`, { 
      params: { dateRange, format: 'pdf' },
      responseType: 'blob' // This is crucial!
    });
    
    return response;
  } catch (error) {
    console.error('Error exporting report as PDF:', error);
    throw error;
  }
};

/**
 * Export report as Excel
 * @param {string} reportType - Type of report (bed-occupancy, staff-utilization, etc.)
 * @param {string} dateRange - Date range for the report
 * @returns {Promise} - Response with Excel download
 */
export const exportReportAsExcel = async (reportType, dateRange = 'week') => {
  try {
    // Important: Set responseType to 'blob' to handle binary data
    const response = await API.get(`/reports/export/${reportType}`, { 
      params: { dateRange, format: 'excel' },
      responseType: 'blob' // This is crucial!
    });
    
    return response;
  } catch (error) {
    console.error('Error exporting report as Excel:', error);
    throw error;
  }
};

/**
 * Fallback mock implementations for testing
 */

// Mock function for bed occupancy report
export const mockGetBedOccupancyReport = () => {
  return Promise.resolve({
    data: {
      success: true,
      data: {
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
      }
    }
  });
};

// Mock function for staff utilization report
export const mockGetStaffUtilizationReport = () => {
  return Promise.resolve({
    data: {
      success: true,
      data: {
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
      }
    }
  });
};

// Mock function for equipment usage report
export const mockGetEquipmentUsageReport = () => {
  return Promise.resolve({
    data: {
      success: true,
      data: {
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
      }
    }
  });
};

// Mock function for department performance report
export const mockGetDepartmentPerformanceReport = () => {
  return Promise.resolve({
    data: {
      success: true,
      data: {
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
      }
    }
  });
};