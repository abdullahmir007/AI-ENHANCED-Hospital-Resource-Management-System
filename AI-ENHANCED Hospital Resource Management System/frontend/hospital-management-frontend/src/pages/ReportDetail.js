import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  getBedOccupancyReport, 
  getStaffUtilizationReport,
  getEquipmentUsageReport,
  getDepartmentPerformanceReport,
  exportReportAsPDF,
  exportReportAsExcel
} from '../services/reportService';
import StatCard from '../components/reports/StatCard';
import ReportChart from '../components/reports/ReportChart';

const ReportDetail = () => {
  const { reportType } = useParams();
  const [searchParams] = useSearchParams();
  const dateRange = searchParams.get('dateRange') || 'week';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching ${reportType} report data with date range: ${dateRange}`);
      let response;
      let title = '';
      let description = '';

      switch (reportType) {
        case 'bed-occupancy':
          response = await getBedOccupancyReport(dateRange);
          title = 'Bed Occupancy Report';
          description = 'Detailed analysis of bed utilization across all departments';
          break;
        case 'staff-utilization':
          response = await getStaffUtilizationReport(dateRange);
          title = 'Staff Utilization Report';
          description = 'Staff workload and allocation efficiency metrics';
          break;
        case 'equipment-usage':
          response = await getEquipmentUsageReport(dateRange);
          title = 'Equipment Usage Report';
          description = 'Utilization metrics for critical hospital equipment';
          break;
        case 'department-performance':
          response = await getDepartmentPerformanceReport(dateRange);
          title = 'Department Performance Report';
          description = 'Performance metrics by department';
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      console.log('Report data received:', response);
      setReportData(response.data.data);
      setReportTitle(title);
      setReportDescription(description);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again.');
      setLoading(false);
      toast.error('Failed to load report data');
    }
  };

  const handleExportReport = async (format) => {
    try {
      setLoading(true);
      if (format === 'pdf') {
        const response = await exportReportAsPDF(reportType, dateRange);
        
        // Create a blob from the PDF data
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Open the PDF in a new tab
        window.open(url, '_blank');
      } else {
        const response = await exportReportAsExcel(reportType, dateRange);
        
        // Create a blob from the Excel data
        const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${reportType}-${dateRange}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast.success(`Report exported as ${format.toUpperCase()} successfully`);
      setLoading(false);
    } catch (err) {
      console.error('Error exporting report:', err);
      toast.error('Failed to export report');
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const formatDateRange = (range) => {
    switch (range) {
      case 'day':
        return 'Today';
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'Last 30 Days';
      case 'quarter':
        return 'Last 3 Months';
      case 'year':
        return 'Last 12 Months';
      case 'custom':
        return 'Custom Range';
      default:
        return range;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={fetchReportData}
        >
          Retry
        </button>
      </div>
    );
  }

  // Render a placeholder report if no data is available
  if (!reportData) {
    return (
      <div className="p-6">
        <button 
          onClick={() => navigate('/reports')}
          className="text-blue-500 hover:text-blue-700 mb-4 flex items-center"
        >
          <span className="mr-1">←</span> Back to Reports
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{reportTitle || 'Report Details'}</h1>
        <p className="text-gray-500">No data available for this report.</p>
      </div>
    );
  }

  // Render appropriate report detail based on report type
  const renderReportContent = () => {
    switch (reportType) {
      case 'bed-occupancy':
        return renderBedOccupancyReport();
      case 'staff-utilization':
        return renderStaffUtilizationReport();
      case 'equipment-usage':
        return renderEquipmentUsageReport();
      case 'department-performance':
        return renderDepartmentPerformanceReport();
      default:
        return (
          <div className="text-center text-gray-500">
            <p>No details available for this report type.</p>
          </div>
        );
    }
  };

  const renderBedOccupancyReport = () => {
    return (
      <div className="space-y-8">
        {/* Summary Stats - Keep existing stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            label="Average Occupancy" 
            value={`${reportData.averageOccupancy}%`}
            color="blue"
          />
          <StatCard 
            label="Peak Occupancy" 
            value={`${reportData.peakOccupancy}%`}
            color="red"
          />
          <StatCard 
            label="Turnover Rate" 
            value={`${reportData.turnoverRate} days`}
            color="green"
          />
        </div>

        {/* Bed Status Summary - NEW */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Bed Status Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <div className="text-xl font-bold text-green-700">{reportData.availableBeds || 0}</div>
              <div className="text-sm text-green-600">Available Beds</div>
            </div>
            <div className="bg-red-50 p-4 rounded border border-red-200">
              <div className="text-xl font-bold text-red-700">{reportData.occupiedBeds || 0}</div>
              <div className="text-sm text-red-600">Occupied Beds</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <div className="text-xl font-bold text-yellow-700">{reportData.reservedBeds || 0}</div>
              <div className="text-sm text-yellow-600">Reserved Beds</div>
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <div className="text-xl font-bold text-gray-700">{reportData.maintenanceBeds || 0}</div>
              <div className="text-sm text-gray-600">Maintenance Beds</div>
            </div>
          </div>
        </div>

        {/* Visualization Section - NEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bed Status Distribution Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Bed Status Distribution</h3>
            <div className="h-72">
              {reportData.bedStatusDistribution && (
                <ReportChart
                  data={reportData.bedStatusDistribution}
                  type="pie"
                  xDataKey="status"
                  yDataKey="count"
                  colors={['#4ade80', '#f87171', '#facc15', '#94a3b8']}
                  title="Bed Status"
                />
              )}
            </div>
          </div>

          {/* Bed Type Distribution Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Bed Type Distribution</h3>
            <div className="h-72">
              {reportData.bedTypeDistribution && (
                <ReportChart
                  data={reportData.bedTypeDistribution}
                  type="bar"
                  xDataKey="type"
                  yDataKey="count"
                  title="Bed Types"
                />
              )}
            </div>
          </div>
        </div>

        {/* Department Breakdown - Keep existing table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Occupancy by Department</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy Rate</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.occupancyByDepartment && reportData.occupancyByDepartment.map((dept, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{dept.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{dept.occupancy}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getOccupancyStatusStyle(dept.occupancy)}`}>
                        {getOccupancyStatus(dept.occupancy)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Occupancy Trend Chart - NEW */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Occupancy Trend</h3>
          <div className="h-72">
            {reportData.occupancyTrend && (
              <ReportChart
                data={reportData.occupancyTrend}
                type="line"
                xDataKey="date"
                yDataKey="occupancy"
                color="#3b82f6"
                title="7-Day Trend"
              />
            )}
          </div>
        </div>

        {/* Recommendations - NEW */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="space-y-4">
            {reportData.averageOccupancy > 80 ? (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-700">High Occupancy Alert</h4>
                    <p className="text-red-600">Hospital is experiencing high bed occupancy ({reportData.averageOccupancy}%). Consider activating surge protocols.</p>
                  </div>
                </div>
              </div>
            ) : reportData.averageOccupancy < 40 ? (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-yellow-700">Low Utilization Notice</h4>
                    <p className="text-yellow-600">Current bed occupancy ({reportData.averageOccupancy}%) is below optimal levels. Consider evaluating staffing allocations.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-green-700">Optimal Utilization</h4>
                    <p className="text-green-600">Bed occupancy is within the optimal range ({reportData.averageOccupancy}%).</p>
                  </div>
                </div>
              </div>
            )}

            {reportData.occupancyByDepartment && reportData.occupancyByDepartment.some(dept => dept.occupancy > 85) && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-orange-700">Department Capacity Alert</h4>
                    <p className="text-orange-600">
                      {reportData.occupancyByDepartment.filter(dept => dept.occupancy > 85).map(dept => dept.department).join(', ')} 
                      {reportData.occupancyByDepartment.filter(dept => dept.occupancy > 85).length === 1 ? ' is' : ' are'} approaching capacity. 
                      Consider redistributing patients to departments with lower occupancy.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {reportData.maintenanceBeds > 5 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-700">Maintenance Recommendation</h4>
                    <p className="text-blue-600">Accelerate maintenance for {reportData.maintenanceBeds} beds currently unavailable to improve overall capacity.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Update the renderStaffUtilizationReport function in ReportDetail.js

const renderStaffUtilizationReport = () => {
  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Staff Utilization" 
          value={`${reportData.staffUtilization}%`}
          color="blue" 
        />
        <StatCard 
          label="Overtime Hours" 
          value={`${reportData.overtimeHours} hrs`}
          color="red" 
        />
        <StatCard 
          label="Staff-to-Patient Ratio" 
          value={`1:${reportData.staffToPatientRatio}`}
          color="green" 
        />
      </div>

      {/* Department Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Utilization by Department</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization Rate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.utilizationByDepartment && reportData.utilizationByDepartment.map((dept, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{dept.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{dept.utilization}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getUtilizationStatusStyle(dept.utilization)}`}>
                      {getUtilizationStatus(dept.utilization)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Utilization Trend */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Staff Utilization Trend</h3>
        
        {/* Add the chart component here */}
        {reportData.staffingTrend && reportData.staffingTrend.length > 0 ? (
          <ReportChart 
            data={reportData.staffingTrend}
            type="line"
            xDataKey="date"
            yDataKey="utilization"
            color="#4f46e5"
            title="Staff Utilization Over Time"
            height={300}
          />
        ) : (
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">No trend data available</p>
          </div>
        )}
        
        {reportData.staffingTrend && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.staffingTrend.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{item.utilization}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Staffing Recommendations</h3>
        <ul className="space-y-2">
          {reportData.staffUtilization > 85 && (
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Staff utilization is high. Consider adding additional personnel or redistributing workload.</span>
            </li>
          )}
          {reportData.utilizationByDepartment && reportData.utilizationByDepartment.some(dept => dept.utilization > 85) && (
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Departments with utilization over 85% may need additional staff support.</span>
            </li>
          )}
          {reportData.overtimeHours > 100 && (
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>High overtime hours detected. Review staff scheduling to prevent burnout.</span>
            </li>
          )}
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Optimize staff scheduling in departments with low utilization to improve efficiency.</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Implement cross-training program to provide more flexible staffing options.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

  const renderEquipmentUsageReport = () => {
    return (
      <div className="space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            label="Equipment Utilization" 
            value={`${reportData.equipmentUtilization}%`}
            color="blue"
          />
          <StatCard 
            label="Maintenance Events" 
            value={reportData.maintenanceEvents}
            color="yellow"
          />
          <StatCard 
            label="Downtime Hours" 
            value={`${reportData.downtimeHours} hrs`}
            color="red"
          />
        </div>

        {/* Equipment Status Summary - NEW */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Equipment Status Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <div className="text-xl font-bold text-green-700">{reportData.availableEquipment || 0}</div>
              <div className="text-xs text-green-600">Available Equipment</div>
            </div>
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <div className="text-xl font-bold text-blue-700">{reportData.inUseEquipment || 0}</div>
              <div className="text-xs text-blue-600">In Use Equipment</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <div className="text-xl font-bold text-yellow-700">{reportData.maintenanceEquipment || 0}</div>
              <div className="text-xs text-yellow-600">Maintenance Equipment</div>
            </div>
          </div>
        </div>

        {/* Visualization Section - NEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Utilization by Category Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Utilization by Category</h3>
            <div className="h-72">
              {reportData.utilizationByCategory && (
                <ReportChart
                  data={reportData.utilizationByCategory}
                  type="bar"
                  xDataKey="category"
                  yDataKey="utilization"
                  title="Category Utilization"
                />
              )}
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Equipment Utilization Trend</h3>
            <div className="h-72">
              {reportData.equipmentTrend && (
                <ReportChart
                  data={reportData.equipmentTrend}
                  type="line"
                  xDataKey="date"
                  yDataKey="utilization"
                  color="#3b82f6"
                  title="Utilization Trend"
                />
              )}
            </div>
          </div>
        </div>

        {/* Category Breakdown - Keep existing table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Utilization by Equipment Category</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization Rate</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.utilizationByCategory && reportData.utilizationByCategory.map((category, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{category.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{category.utilization}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getUtilizationStatusStyle(category.utilization)}`}>
                        {getUtilizationStatus(category.utilization)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations - NEW */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Equipment Insights & Recommendations</h3>
          <div className="space-y-4">
            {reportData.downtimeHours > 30 && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-700">High Downtime Alert</h4>
                    <p className="text-red-600">Equipment downtime is high ({reportData.downtimeHours} hours). Consider reviewing maintenance procedures and equipment reliability.</p>
                  </div>
                </div>
              </div>
            )}

            {reportData.utilizationByCategory && reportData.utilizationByCategory.some(cat => cat.utilization > 85) && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-orange-700">High Utilization Alert</h4>
                    <p className="text-orange-600">
                      {reportData.utilizationByCategory.filter(cat => cat.utilization > 85).map(cat => cat.category).join(', ')} 
                      {reportData.utilizationByCategory.filter(cat => cat.utilization < 85).length === 1 ? ' has' : ' have'} low utilization {'<'}85%).
                      Consider investing in additional equipment for these categories.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {reportData.utilizationByCategory && reportData.utilizationByCategory.some(cat => cat.utilization < 60) && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-700">Low Utilization Notice</h4>
                    <p className="text-blue-600">
                    {reportData.utilizationByCategory.filter(cat => cat.utilization < 60).map(cat => cat.category).join(', ')} 
                    {reportData.utilizationByCategory.filter(cat => cat.utilization < 60).length === 1 ? ' has' : ' have'} low utilization {'<'}60%).
                     Consider reallocating these resources to departments with higher demand.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-green-700">Maintenance Optimization</h4>
                  <p className="text-green-600">Schedule preventive maintenance during off-peak hours to minimize impact on equipment availability.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDepartmentPerformanceReport = () => {
    return (
      <div className="space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            label="Top Department" 
            value={reportData.topDepartment}
            color="blue" 
          />
          <StatCard 
            label="Avg. Response Time" 
            value={`${reportData.avgResponseTime} min`}
            color="green" 
          />
          <StatCard 
            label="Patient Throughput" 
            value={`${reportData.patientThroughput}/day`}
            color="purple" 
          />
        </div>

        {/* Department Performance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Department Performance Metrics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time (min)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.departmentPerformance && reportData.departmentPerformance.map((dept, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{dept.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{dept.performance}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reportData.responseTimes && 
                       reportData.responseTimes.find(rt => rt.department === dept.department)?.time || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Performance Improvement Recommendations</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Apply best practices from top-performing departments to improve lower-performing areas.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Streamline patient intake and discharge processes to increase throughput.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Implement performance incentives based on departmental metrics.</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // Helper functions for status styles and text
  const getOccupancyStatus = (rate) => {
    if (rate > 90) return 'High';
    if (rate > 70) return 'Optimal';
    return 'Low';
  };

  const getOccupancyStatusStyle = (rate) => {
    if (rate > 90) return 'bg-red-100 text-red-800';
    if (rate > 70) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getUtilizationStatus = (rate) => {
    if (rate > 85) return 'Overutilized';
    if (rate > 65) return 'Optimal';
    return 'Underutilized';
  };

  const getUtilizationStatusStyle = (rate) => {
    if (rate > 85) return 'bg-red-100 text-red-800';
    if (rate > 65) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="p-6">
      {/* Header with navigation and actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <button 
            onClick={() => navigate('/reports')}
            className="text-blue-500 hover:text-blue-700 mb-4 md:mb-0 flex items-center"
          >
            <span className="mr-1">←</span> Back to Reports
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{reportTitle}</h1>
          <p className="text-gray-600">{reportDescription}</p>
          <p className="text-sm text-gray-500 mt-1">
            Date Range: {formatDateRange(dateRange)}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <button
            onClick={() => handleExportReport('excel')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="mr-1 animate-spin">⟳</span>
            ) : (
              <span className="mr-1">📊</span>
            )}
            Export Excel
          </button>
          <button
            onClick={() => handleExportReport('pdf')}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="mr-1 animate-spin">⟳</span>
            ) : (
              <span className="mr-1">📄</span>
            )}
            Export PDF
          </button>
          <button
            onClick={handlePrintReport}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="mr-1 animate-spin">⟳</span>
            ) : (
              <span className="mr-1">🖨️</span>
            )}
            Print
          </button>
        </div>
      </div>

      {/* Report content */}
      <div className="mt-8">
        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportDetail;