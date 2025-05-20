import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Remove the service imports that might be causing errors
// Will use mock data only for now
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StaffPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [staffStats, setStaffStats] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [filters, setFilters] = useState({
    period: '30days',
    department: '',
    staffType: '',
    metric: 'efficiency'
  });
  const [activeTab, setActiveTab] = useState('overview');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setPerformanceData(mockPerformanceData);
      setStaffStats(mockStaffStats);
      setTopPerformers(mockTopPerformers);
      setLoading(false);
    }, 1000);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleStaffClick = (staffId) => {
    navigate(`/staff/${staffId}/performance`);
  };
  
  const handleExportReport = () => {
    // In a real app, this would generate a downloadable report
    alert('Exporting Performance Report...');
  };
  
  // Mock data for development
  const mockStaffStats = {
    total: 500,
    onDuty: 280,
    averagePatientRatio: 3.5,
    averageHoursWorked: 8.75,
    averageOvertime: 1.2,
    averageUtilization: 78,
    byDepartment: [
      { department: 'ER', count: 120, utilization: 86 },
      { department: 'ICU', count: 95, utilization: 82 },
      { department: 'General Ward', count: 150, utilization: 75 },
      { department: 'Surgery', count: 80, utilization: 71 },
      { department: 'Pediatrics', count: 55, utilization: 68 }
    ],
    byRole: [
      { role: 'Nurse', count: 210, utilization: 83 },
      { role: 'Physician', count: 125, utilization: 77 },
      { role: 'Surgeon', count: 80, utilization: 75 },
      { role: 'Technician', count: 85, utilization: 72 }
    ]
  };
  
  const mockPerformanceData = {
    overallMetrics: {
      efficiency: 78,
      patientSatisfaction: 85,
      patientOutcomes: 82,
      teamCollaboration: 77,
      workloadBalance: 71
    },
    trends: {
      efficiency: [
        { date: '2025-02-15', value: 76 },
        { date: '2025-02-20', value: 77 },
        { date: '2025-02-25', value: 75 },
        { date: '2025-03-01', value: 74 },
        { date: '2025-03-05', value: 76 },
        { date: '2025-03-10', value: 77 },
        { date: '2025-03-15', value: 79 },
        { date: '2025-03-20', value: 78 },
        { date: '2025-03-25', value: 80 },
        { date: '2025-03-30', value: 79 },
        { date: '2025-04-04', value: 78 },
        { date: '2025-04-09', value: 79 }
      ],
      patientSatisfaction: [
        { date: '2025-02-15', value: 82 },
        { date: '2025-02-20', value: 83 },
        { date: '2025-02-25', value: 84 },
        { date: '2025-03-01', value: 84 },
        { date: '2025-03-05', value: 83 },
        { date: '2025-03-10', value: 84 },
        { date: '2025-03-15', value: 85 },
        { date: '2025-03-20', value: 85 },
        { date: '2025-03-25', value: 86 },
        { date: '2025-03-30', value: 86 },
        { date: '2025-04-04', value: 85 },
        { date: '2025-04-09', value: 85 }
      ],
      patientCare: [
        { date: '2025-02-15', value: 81 },
        { date: '2025-02-20', value: 80 },
        { date: '2025-02-25', value: 81 },
        { date: '2025-03-01', value: 82 },
        { date: '2025-03-05', value: 81 },
        { date: '2025-03-10', value: 82 },
        { date: '2025-03-15', value: 83 },
        { date: '2025-03-20', value: 82 },
        { date: '2025-03-25', value: 83 },
        { date: '2025-03-30', value: 82 },
        { date: '2025-04-04', value: 83 },
        { date: '2025-04-09', value: 82 }
      ]
    },
    departmentComparison: [
      { department: 'ER', efficiency: 82, satisfaction: 79, outcomes: 77 },
      { department: 'ICU', efficiency: 85, satisfaction: 82, outcomes: 86 },
      { department: 'General Ward', efficiency: 76, satisfaction: 88, outcomes: 80 },
      { department: 'Surgery', efficiency: 79, satisfaction: 84, outcomes: 89 },
      { department: 'Pediatrics', efficiency: 74, satisfaction: 91, outcomes: 83 }
    ],
    staffTypeComparison: [
      { staffType: 'Nurse', efficiency: 81, satisfaction: 87, outcomes: 80 },
      { staffType: 'Physician', efficiency: 78, satisfaction: 83, outcomes: 85 },
      { staffType: 'Surgeon', efficiency: 77, satisfaction: 80, outcomes: 88 },
      { staffType: 'Technician', efficiency: 75, satisfaction: 82, outcomes: 76 }
    ],
    workloadDistribution: {
      patientsPerStaff: [
        { range: '1-2', count: 85 },
        { range: '3-4', count: 210 },
        { range: '5-6', count: 125 },
        { range: '7-8', count: 60 },
        { range: '9+', count: 20 }
      ],
      hoursPerShift: [
        { range: '<8', count: 120 },
        { range: '8', count: 265 },
        { range: '9-10', count: 75 },
        { range: '11-12', count: 35 },
        { range: '12+', count: 5 }
      ]
    }
  };
  
  const mockTopPerformers = [
    { _id: '1', name: 'Dr. John Smith', staffId: 'S001', staffType: 'Surgeon', department: 'Surgery', efficiency: 94, patientSatisfaction: 92 },
    { _id: '2', name: 'Sarah Johnson', staffId: 'S045', staffType: 'Nurse', department: 'ICU', efficiency: 93, patientSatisfaction: 96 },
    { _id: '3', name: 'Dr. Emily Chen', staffId: 'S012', staffType: 'Physician', department: 'ER', efficiency: 91, patientSatisfaction: 89 },
    { _id: '4', name: 'Robert Williams', staffId: 'S078', staffType: 'Nurse', department: 'Pediatrics', efficiency: 90, patientSatisfaction: 95 },
    { _id: '5', name: 'Michael Rodriguez', staffId: 'S103', staffType: 'Technician', department: 'Radiology', efficiency: 89, patientSatisfaction: 88 }
  ];

  // Use mock data
  const performanceResults = performanceData || mockPerformanceData;
  const statsResults = staffStats || mockStaffStats;
  const topPerformersResults = topPerformers.length > 0 ? topPerformers : mockTopPerformers;

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Performance Analytics</h1>
        <div className="space-x-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={handleExportReport}
          >
            Export Report
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              <option value="ER">Emergency Room</option>
              <option value="ICU">Intensive Care</option>
              <option value="General Ward">General Ward</option>
              <option value="Surgery">Surgery</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
            <select
              name="staffType"
              value={filters.staffType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Staff Types</option>
              <option value="Nurse">Nurses</option>
              <option value="Physician">Physicians</option>
              <option value="Surgeon">Surgeons</option>
              <option value="Technician">Technicians</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Performance Metric</label>
            <select
              name="metric"
              value={filters.metric}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="efficiency">Staff Efficiency</option>
              <option value="patientSatisfaction">Patient Satisfaction</option>
              <option value="patientOutcomes">Patient Outcomes</option>
              <option value="teamCollaboration">Team Collaboration</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('overview')}
            >
              Performance Overview
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'trends'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('trends')}
            >
              Performance Trends
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'comparison'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('comparison')}
            >
              Department Comparison
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'workload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('workload')}
            >
              Workload Analysis
            </button>
          </nav>
        </div>
        
        {/* Performance Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Staff Efficiency</div>
                <div className="text-2xl font-bold text-blue-600">{performanceResults.overallMetrics.efficiency}%</div>
                <div className="text-xs text-gray-500 mt-1">Overall score</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Patient Satisfaction</div>
                <div className="text-2xl font-bold text-green-600">{performanceResults.overallMetrics.patientSatisfaction}%</div>
                <div className="text-xs text-gray-500 mt-1">Average rating</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Patient Outcomes</div>
                <div className="text-2xl font-bold text-purple-600">{performanceResults.overallMetrics.patientOutcomes}%</div>
                <div className="text-xs text-gray-500 mt-1">Success rate</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Team Collaboration</div>
                <div className="text-2xl font-bold text-amber-600">{performanceResults.overallMetrics.teamCollaboration}%</div>
                <div className="text-xs text-gray-500 mt-1">Collaboration score</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Workload Balance</div>
                <div className="text-2xl font-bold text-red-600">{performanceResults.overallMetrics.workloadBalance}%</div>
                <div className="text-xs text-gray-500 mt-1">Balance score</div>
              </div>
            </div>
            
            {/* Top Performers Table */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-4">Top Performers</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topPerformersResults.map((staff) => (
                      <tr 
                        key={staff._id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleStaffClick(staff._id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {staff.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.staffId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.staffType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-2">{staff.efficiency}%</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${staff.efficiency}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-2">{staff.patientSatisfaction}%</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full"
                                style={{ width: `${staff.patientSatisfaction}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Performance Trends Tab */}
        {activeTab === 'trends' && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Efficiency Trend */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Efficiency Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceResults.trends.efficiency}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis domain={[60, 100]} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Efficiency']}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Efficiency Score" 
                        stroke="#0088FE" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Patient Satisfaction Trend */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Patient Satisfaction Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceResults.trends.patientSatisfaction}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis domain={[60, 100]} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Satisfaction']}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Satisfaction Score" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Department Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Department Efficiency Comparison */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Department Efficiency Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceResults.departmentComparison}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      barSize={40}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Efficiency']} />
                      <Legend />
                      <Bar 
                        dataKey="efficiency" 
                        name="Efficiency" 
                        fill="#0088FE" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Department Patient Satisfaction */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Department Patient Satisfaction</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceResults.departmentComparison}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      barSize={40}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Satisfaction']} />
                      <Legend />
                      <Bar 
                        dataKey="satisfaction" 
                        name="Patient Satisfaction" 
                        fill="#00C49F" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Workload Analysis Tab */}
        {activeTab === 'workload' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Patients Per Staff Distribution */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Patients Per Staff Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={performanceResults.workloadDistribution.patientsPerStaff}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="range"
                        label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {performanceResults.workloadDistribution.patientsPerStaff.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} staff`, props.payload.range]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Hours Per Shift Distribution */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Hours Per Shift Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={performanceResults.workloadDistribution.hoursPerShift}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="range"
                        label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {performanceResults.workloadDistribution.hoursPerShift.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} staff`, props.payload.range]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Average Patient Ratio */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Patient-Staff Ratio</h3>
                    <p className="text-gray-500 text-sm">Average patients per staff</p>
                  </div>
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">{statsResults.averagePatientRatio}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    The patient-to-staff ratio is a key indicator of workload distribution and potential staff burnout.
                    Optimal ratios vary by department, but should generally remain below 4.5.
                  </p>
                </div>
              </div>
              
              {/* Average Hours Worked */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Hours Per Shift</h3>
                    <p className="text-gray-500 text-sm">Average hours worked per shift</p>
                  </div>
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">{statsResults.averageHoursWorked}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Standard shifts are 8 hours, with some departments requiring extended coverage.
                    Consistently high average hours may indicate staffing shortages.
                  </p>
                </div>
              </div>
              
              {/* Average Overtime */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Overtime Hours</h3>
                    <p className="text-gray-500 text-sm">Average overtime per staff member</p>
                  </div>
                  <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-amber-600">{statsResults.averageOvertime}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Overtime should be minimized to prevent burnout and maintain quality of care.
                    Departments with consistently high overtime may need staffing adjustments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default StaffPerformance;