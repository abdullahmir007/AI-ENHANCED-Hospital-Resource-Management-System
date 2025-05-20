import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReportCard from '../components/reports/ReportCard';
import { 
  getBedOccupancyReport, 
  getStaffUtilizationReport,
  getEquipmentUsageReport,
  getDepartmentPerformanceReport,
  exportReportAsPDF,
  exportReportAsExcel
} from '../services/reportService';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('operational');
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for each report type
  const [bedOccupancyData, setBedOccupancyData] = useState(null);
  const [staffUtilizationData, setStaffUtilizationData] = useState(null);
  const [equipmentUsageData, setEquipmentUsageData] = useState(null);
  const [departmentPerformanceData, setDepartmentPerformanceData] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all operational reports data when the component mounts or date range changes
    if (activeTab === 'operational') {
      fetchOperationalReports();
    }
    // Other tabs would have their own fetch functions
  }, [selectedDateRange, activeTab]);

  const fetchOperationalReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching operational reports with date range:', selectedDateRange);
      
      // Fetch all operational reports in parallel for better performance
      const [bedData, staffData, equipmentData, departmentData] = await Promise.all([
        getBedOccupancyReport(selectedDateRange),
        getStaffUtilizationReport(selectedDateRange),
        getEquipmentUsageReport(selectedDateRange),
        getDepartmentPerformanceReport(selectedDateRange)
      ]);
      
      console.log('Reports data received successfully');
      
      // Set state with the fetched data
      setBedOccupancyData(bedData.data.data);
      setStaffUtilizationData(staffData.data.data);
      setEquipmentUsageData(equipmentData.data.data);
      setDepartmentPerformanceData(departmentData.data.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load report data. Please try again.');
      setLoading(false);
      toast.error('Failed to load reports data');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Fetch data specific to the selected tab
    if (tab === 'operational') {
      fetchOperationalReports();
    }
    // Add similar functions for financial and clinical reports
  };

  const handleDateRangeChange = (e) => {
    setSelectedDateRange(e.target.value);
  };

  const handleExportReport = async () => {
    try {
      setLoading(true);
      
      // Determine which report to export based on the active tab
      let reportType = 'bed-occupancy'; // Default
      if (activeTab === 'operational') {
        // You can be more specific based on which operational report to export
        reportType = 'bed-occupancy';
      } else if (activeTab === 'financial') {
        reportType = 'revenue-summary';
      } else if (activeTab === 'clinical') {
        reportType = 'patient-outcomes';
      }
      
      const response = await exportReportAsExcel(reportType, selectedDateRange);
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-${selectedDateRange}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Report exported successfully');
      setLoading(false);
    } catch (err) {
      console.error('Error exporting report:', err);
      toast.error('Failed to export report');
      setLoading(false);
    }
  };
  
  const handlePrintReport = async () => {
    try {
      setLoading(true);
      
      // Determine which report to print based on the active tab
      let reportType = 'bed-occupancy'; // Default
      if (activeTab === 'operational') {
        // You can be more specific based on which operational report to print
        reportType = 'bed-occupancy';
      } else if (activeTab === 'financial') {
        reportType = 'revenue-summary';
      } else if (activeTab === 'clinical') {
        reportType = 'patient-outcomes';
      }
      
      const response = await exportReportAsPDF(reportType, selectedDateRange);
      
      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open the PDF in a new tab for printing
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        // Wait for the PDF to load then print
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      } else {
        // If popup is blocked, provide the URL for manual download
        toast.info('Please allow popups to view and print the report');
      }
      
      setLoading(false);
      toast.success('Report ready for printing');
    } catch (err) {
      console.error('Error preparing report for print:', err);
      toast.error('Failed to prepare report for printing');
      setLoading(false);
    }
  };
  const handleViewFullReport = (reportType) => {
    navigate(`/reports/${reportType}?dateRange=${selectedDateRange}`);
  };

  // Show loading state
  if (loading && !bedOccupancyData) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error && !bedOccupancyData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={fetchOperationalReports}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <div className="space-x-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            onClick={handleExportReport}
            disabled={loading}
          >
            {loading ? (
              <span className="mr-2 animate-spin">⟳</span>
            ) : (
              <span className="mr-2">📊</span>
            )}
            Export Report
          </button>
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
            onClick={handlePrintReport}
            disabled={loading}
          >
            {loading ? (
              <span className="mr-2 animate-spin">⟳</span>
            ) : (
              <span className="mr-2">🖨️</span>
            )}
            Print Report
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={selectedDateRange}
              onChange={handleDateRangeChange}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 rounded-md bg-blue-600 text-white"
              onClick={() => handleTabChange('operational')}
            >
              Operational Reports
            </button>
          </div>
        </div>
      </div>

      {/* Operational Reports */}
      {activeTab === 'operational' && bedOccupancyData && staffUtilizationData && equipmentUsageData && departmentPerformanceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReportCard 
            title="Bed Occupancy Report"
            description="Detailed analysis of bed utilization across all departments"
            stats={[
              { label: 'Average Occupancy', value: `${bedOccupancyData.averageOccupancy}%` },
              { label: 'Peak Occupancy', value: `${bedOccupancyData.peakOccupancy}%` },
              { label: 'Turnover Rate', value: `${bedOccupancyData.turnoverRate} days` }
            ]}
            onViewFullReport={() => handleViewFullReport('bed-occupancy')}
          />
          
          <ReportCard 
            title="Staff Utilization Report"
            description="Staff workload and allocation efficiency metrics"
            stats={[
              { label: 'Staff Utilization', value: `${staffUtilizationData.staffUtilization}%` },
              { label: 'Overtime Hours', value: `${staffUtilizationData.overtimeHours} hrs` },
              { label: 'Staff-to-Patient Ratio', value: `1:${staffUtilizationData.staffToPatientRatio}` }
            ]}
            onViewFullReport={() => handleViewFullReport('staff-utilization')}
          />
          
          <ReportCard 
            title="Equipment Usage Report"
            description="Utilization metrics for critical hospital equipment"
            stats={[
              { label: 'Equipment Utilization', value: `${equipmentUsageData.equipmentUtilization}%` },
              { label: 'Maintenance Events', value: `${equipmentUsageData.maintenanceEvents}` },
              { label: 'Downtime Hours', value: `${equipmentUsageData.downtimeHours} hrs` }
            ]}
            onViewFullReport={() => handleViewFullReport('equipment-usage')}
          />
          
          <ReportCard 
            title="Department Performance"
            description="Performance metrics by department"
            stats={[
              { label: 'Top Department', value: departmentPerformanceData.topDepartment },
              { label: 'Avg. Response Time', value: `${departmentPerformanceData.avgResponseTime} min` },
              { label: 'Patient Throughput', value: `${departmentPerformanceData.patientThroughput}/day` }
            ]}
            onViewFullReport={() => handleViewFullReport('department-performance')}
          />
        </div>
      )}

      {/* Financial Reports - Would be populated with real data when implemented */}
      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReportCard 
            title="Revenue Summary"
            description="Overview of hospital revenue sources and trends"
            stats={[
              { label: 'Total Revenue', value: '$1.45M' },
              { label: 'Revenue Growth', value: '+7.2%' },
              { label: 'Avg. Patient Bill', value: '$2,850' }
            ]}
            onViewFullReport={() => handleViewFullReport('revenue-summary')}
          />
          
          <ReportCard 
            title="Expense Analysis"
            description="Breakdown of hospital operational expenses"
            stats={[
              { label: 'Total Expenses', value: '$1.12M' },
              { label: 'Largest Category', value: 'Staffing' },
              { label: 'Cost Reduction', value: '5.1%' }
            ]}
            onViewFullReport={() => handleViewFullReport('expense-analysis')}
          />
          
          <ReportCard 
            title="Insurance Claims"
            description="Insurance claim processing and approval rates"
            stats={[
              { label: 'Claims Processed', value: '1,245' },
              { label: 'Approval Rate', value: '87.3%' },
              { label: 'Avg. Processing', value: '14.5 days' }
            ]}
            onViewFullReport={() => handleViewFullReport('insurance-claims')}
          />
          
          <ReportCard 
            title="Budget Performance"
            description="Actual vs. budgeted expenses by department"
            stats={[
              { label: 'Budget Variance', value: '-2.1%' },
              { label: 'Cost Per Patient', value: '$842' },
              { label: 'Resource Efficiency', value: '91.2%' }
            ]}
            onViewFullReport={() => handleViewFullReport('budget-performance')}
          />
        </div>
      )}

      {/* Clinical Reports - Would be populated with real data when implemented */}
      {activeTab === 'clinical' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReportCard 
            title="Patient Outcomes"
            description="Treatment success rates and patient outcomes"
            stats={[
              { label: 'Recovery Rate', value: '92.5%' },
              { label: 'Readmission Rate', value: '4.8%' },
              { label: 'Avg. Length of Stay', value: '3.2 days' }
            ]}
            onViewFullReport={() => handleViewFullReport('patient-outcomes')}
          />
          
          <ReportCard 
            title="Treatment Efficacy"
            description="Analysis of treatment protocols and efficacy"
            stats={[
              { label: 'Protocol Adherence', value: '96.2%' },
              { label: 'Treatment Success', value: '88.7%' },
              { label: 'Complication Rate', value: '3.1%' }
            ]}
            onViewFullReport={() => handleViewFullReport('treatment-efficacy')}
          />
          
          <ReportCard 
            title="Patient Satisfaction"
            description="Patient feedback and satisfaction metrics"
            stats={[
              { label: 'Overall Satisfaction', value: '4.6/5' },
              { label: 'Staff Rating', value: '4.8/5' },
              { label: 'Facility Rating', value: '4.5/5' }
            ]}
            onViewFullReport={() => handleViewFullReport('patient-satisfaction')}
          />
          
          <ReportCard 
            title="Disease Statistics"
            description="Common diagnoses and treatment statistics"
            stats={[
              { label: 'Top Diagnosis', value: 'Respiratory' },
              { label: 'Avg. Treatment', value: '2.4 days' },
              { label: 'Follow-up Rate', value: '78.3%' }
            ]}
            onViewFullReport={() => handleViewFullReport('disease-statistics')}
          />
        </div>
      )}
    </div>
  );
};

export default Reports;