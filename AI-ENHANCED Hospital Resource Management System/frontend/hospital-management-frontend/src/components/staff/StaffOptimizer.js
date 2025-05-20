import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOptimalStaffing, getStaffUtilization } from '../../services/StaffService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StaffOptimizer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);
  const [utilizationData, setUtilizationData] = useState(null);
  const [filters, setFilters] = useState({
    period: '7days',
    department: '',
    startDate: '',
    endDate: ''
  });
  const [activeTab, setActiveTab] = useState('current');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get date range based on selected period
        let dateParams = {};
        const today = new Date();
        
        if (filters.period === '7days') {
          const startDate = new Date();
          startDate.setDate(today.getDate() - 7);
          dateParams = {
            startDate: startDate.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
          };
        } else if (filters.period === '30days') {
          const startDate = new Date();
          startDate.setDate(today.getDate() - 30);
          dateParams = {
            startDate: startDate.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
          };
        } else if (filters.period === 'custom') {
          dateParams = {
            startDate: filters.startDate,
            endDate: filters.endDate
          };
        }
        
        // Fetch optimal staffing data
        const optimizationResponse = await getOptimalStaffing({
          ...filters,
          ...dateParams
        });
        
        setOptimizationData(optimizationResponse.data.data);
        
        // Fetch staff utilization data
        const utilizationResponse = await getStaffUtilization({
          ...filters,
          ...dateParams
        });
        
        setUtilizationData(utilizationResponse.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch optimization data');
        setLoading(false);
        console.error('Error fetching optimization data:', err);
      }
    };
    
    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleImplement = (recommendationId) => {
    // Implementation logic would go here
    alert(`Implementing recommendation ${recommendationId}`);
  };
  
  const handleScheduleView = () => {
    navigate('/staff/schedule');
  };
  
  // Mock data for development
  const mockOptimizationData = {
    current: {
      staffingLevels: {
        total: 500,
        departments: [
          { name: 'ER', total: 120, onDuty: {morning: 40, evening: 38, night: 25} },
          { name: 'ICU', total: 95, onDuty: {morning: 30, evening: 28, night: 20} },
          { name: 'General Ward', total: 150, onDuty: {morning: 45, evening: 40, night: 30} },
          { name: 'Surgery', total: 80, onDuty: {morning: 30, evening: 25, night: 10} },
          { name: 'Pediatrics', total: 55, onDuty: {morning: 20, evening: 15, night: 10} }
        ],
        staffTypes: [
          { type: 'Surgeon', total: 162 },
          { type: 'Nurse', total: 173 },
          { type: 'Technician', total: 165 }
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
        trend: [
          { date: '2025-04-04', patients: 370 },
          { date: '2025-04-05', patients: 365 },
          { date: '2025-04-06', patients: 375 },
          { date: '2025-04-07', patients: 390 },
          { date: '2025-04-08', patients: 385 },
          { date: '2025-04-09', patients: 380 },
          { date: '2025-04-10', patients: 382 }
        ]
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
          { name: 'ER', current: 120, recommended: 135, change: '+15' },
          { name: 'ICU', current: 95, recommended: 100, change: '+5' },
          { name: 'General Ward', current: 150, recommended: 140, change: '-10' },
          { name: 'Surgery', current: 80, recommended: 75, change: '-5' },
          { name: 'Pediatrics', current: 55, recommended: 50, change: '-5' }
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
  
  const mockUtilizationData = {
    byStaffType: [
      { type: 'Nurse', utilization: 87, target: 75, headcount: 173 },
      { type: 'Surgeon', utilization: 68, target: 70, headcount: 162 },
      { type: 'Technician', utilization: 72, target: 75, headcount: 165 }
    ],
    byDepartment: [
      { department: 'ER', utilization: 92, target: 80, staffCount: 120 },
      { department: 'ICU', utilization: 85, target: 80, staffCount: 95 },
      { department: 'General Ward', utilization: 75, target: 75, staffCount: 150 },
      { department: 'Surgery', utilization: 65, target: 70, staffCount: 80 },
      { department: 'Pediatrics', utilization: 70, target: 75, staffCount: 55 }
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

  // Use mock data if API data is not available
  const optimizationResults = optimizationData || mockOptimizationData;
  const utilizationResults = utilizationData || mockUtilizationData;

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Staff Optimization</h1>
        <div className="space-x-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={handleScheduleView}
          >
            View Schedule
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
              <option value="custom">Custom Range</option>
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
          
          {filters.period === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
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
                activeTab === 'current'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('current')}
            >
              Current Analysis
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'optimized'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('optimized')}
            >
              Optimization Recommendations
            </button>
          </nav>
        </div>
        
        {/* Current Analysis Tab */}
        {activeTab === 'current' && (
          <div className="p-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Total Staff</div>
                <div className="text-2xl font-bold text-blue-600">{optimizationResults.current.staffingLevels.total}</div>
                <div className="text-xs text-gray-500 mt-1">Across all departments</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Total Patients</div>
                <div className="text-2xl font-bold text-green-600">{optimizationResults.current.patientLoad.total}</div>
                <div className="text-xs text-gray-500 mt-1">Currently under care</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Staff Utilization</div>
                <div className="text-2xl font-bold text-amber-600">{optimizationResults.current.utilization.overall}%</div>
                <div className="text-xs text-gray-500 mt-1">Average across all staff</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Issues Detected</div>
                <div className="text-2xl font-bold text-red-600">{optimizationResults.current.issues.length}</div>
                <div className="text-xs text-gray-500 mt-1">Requiring attention</div>
              </div>
            </div>
            
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Patient Load Trend */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Patient Load Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={optimizationResults.current.patientLoad.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} patients`, 'Patient Load']}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="patients" 
                        name="Patient Count" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Department Utilization */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Department Utilization</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={optimizationResults.current.utilization.byDepartment}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      barSize={35}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                      <Legend />
                      <Bar dataKey="utilization" name="Utilization" fill="#3b82f6">
                        {optimizationResults.current.utilization.byDepartment.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.utilization > 85 ? '#ef4444' : entry.utilization > 75 ? '#f59e0b' : '#3b82f6'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Staff Distribution */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Staff Distribution by Type</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={optimizationResults.current.staffingLevels.staffTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="type"
                        label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {optimizationResults.current.staffingLevels.staffTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} staff`, props.payload.type]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Shift Utilization */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Utilization by Shift</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={optimizationResults.current.utilization.byShift}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      barSize={50}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="shift" />
                      <YAxis domain={[0, 100]} label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                      <Legend />
                      <Bar dataKey="utilization" name="Shift Utilization" fill="#8884d8">
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#6366f1" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Issues Table */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-4">Detected Staffing Issues</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {optimizationResults.current.issues.map((issue) => (
                      <tr key={issue.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getSeverityColor(issue.severity)}-100 text-${getSeverityColor(issue.severity)}-800`}>
                            {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {issue.area}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {issue.issue}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{issue.impactScore}</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`bg-${getSeverityColor(issue.severity)}-600 h-2.5 rounded-full`}
                                style={{ width: `${issue.impactScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleTabChange('optimized')}
                          >
                            View Recommendations
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Optimization Recommendations Tab */}
        {activeTab === 'optimized' && (
          <div className="p-6">
            {/* Optimization Overview */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-medium mb-4">Optimization Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-500 mb-1">Expected Cost Savings</div>
                  <div className="text-xl font-bold text-blue-700">{optimizationResults.optimized.expectedOutcomes.costSavings}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-gray-500 mb-1">Staff Utilization Improvement</div>
                  <div className="text-xl font-bold text-green-700">{optimizationResults.optimized.expectedOutcomes.staffUtilization}</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-gray-500 mb-1">Patient Care Metrics</div>
                  <div className="text-xl font-bold text-purple-700">{optimizationResults.optimized.expectedOutcomes.patientCareMetrics}</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-sm text-gray-500 mb-1">Staff Satisfaction</div>
                  <div className="text-xl font-bold text-amber-700">{optimizationResults.optimized.expectedOutcomes.staffSatisfaction}</div>
                </div>
              </div>
            </div>
            
            {/* Department Staffing Comparison */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-medium mb-4">Department Staffing Comparison</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Staff</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended Staff</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {optimizationResults.optimized.staffingLevels.departments.map((dept, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dept.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dept.current}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dept.recommended}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full ${
                            dept.change.startsWith('+') ? 'bg-green-100 text-green-800' : 
                            dept.change.startsWith('-') ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {dept.change}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Shift Optimization */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-medium mb-4">Shift-Level Optimization</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan="2">Morning Shift</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan="2">Evening Shift</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan="2">Night Shift</th>
                    </tr>
                    <tr>
                      <th className="px-6 py-3"></th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">Current</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">Recommended</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">Current</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">Recommended</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">Current</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">Recommended</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {optimizationResults.optimized.staffingLevels.shifts.map((shift, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {shift.area}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {shift.morning.current}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center text-sm">
                          <span className={`px-2 py-1 rounded-full ${
                            shift.morning.change.startsWith('+') ? 'bg-green-100 text-green-800' : 
                            shift.morning.change.startsWith('-') ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {shift.morning.recommended} ({shift.morning.change})
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {shift.evening.current}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center text-sm">
                          <span className={`px-2 py-1 rounded-full ${
                            shift.evening.change.startsWith('+') ? 'bg-green-100 text-green-800' : 
                            shift.evening.change.startsWith('-') ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {shift.evening.recommended} ({shift.evening.change})
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {shift.night.current}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center text-sm">
                          <span className={`px-2 py-1 rounded-full ${
                            shift.night.change.startsWith('+') ? 'bg-green-100 text-green-800' : 
                            shift.night.change.startsWith('-') ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {shift.night.recommended} ({shift.night.change})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Detailed Recommendations */}
            <h3 className="text-lg font-medium mb-4">Recommended Actions</h3>
            <div className="space-y-6">
              {optimizationResults.optimized.recommendations.map((rec) => (
                <div key={rec.id} className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{rec.recommendation}</h4>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 mr-3">Department: {rec.area}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${
                          rec.impact === 'High' ? 'red' : 
                          rec.impact === 'Medium' ? 'yellow' : 'blue'
                        }-100 text-${
                          rec.impact === 'High' ? 'red' : 
                          rec.impact === 'Medium' ? 'yellow' : 'blue'
                        }-800`}>
                          {rec.impact} Impact
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleImplement(rec.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Implement
                    </button>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{rec.details}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Benefits</h5>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {rec.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                      
                      <h5 className="font-medium text-gray-900 mt-4 mb-2">Costs & Resources</h5>
                      <p className="text-gray-700">{rec.costsAndResources}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Implementation Steps</h5>
                      <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                        {rec.implementationSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffOptimizer;