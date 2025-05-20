import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const BedOccupancyDashboardWidget = ({ onViewFullReport }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  const STATUS_COLORS = {
    'Available': '#4ade80',
    'Occupied': '#f87171',
    'Reserved': '#facc15',
    'Maintenance': '#94a3b8'
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would be an API call
      // const response = await getBedOccupancyReport('week');
      // setData(response.data.data);
      
      // Mock data for demonstration
      const mockData = {
        averageOccupancy: 82,
        peakOccupancy: 94,
        turnoverRate: 3.5,
        totalBeds: 60,
        maintenanceBeds: 10,
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
        ],
        bedStatusDistribution: [
          { status: 'Available', count: 18, percentage: 30 },
          { status: 'Occupied', count: 15, percentage: 25 },
          { status: 'Reserved', count: 17, percentage: 28 },
          { status: 'Maintenance', count: 10, percentage: 17 }
        ]
      };
      
      setData(mockData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bed occupancy data:', err);
      setError('Failed to load bed occupancy data');
      setLoading(false);
    }
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-blue-800">Bed Occupancy</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-blue-800">Bed Occupancy</h3>
        </div>
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-blue-800">Bed Occupancy</h3>
        </div>
        <div className="text-gray-500 text-center">No data available</div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-blue-800">Bed Occupancy</h3>
        <div className="text-sm text-gray-500">Last 7 Days</div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-blue-50 p-2 rounded">
          <div className="text-xl font-bold text-blue-700">{data.averageOccupancy}%</div>
          <div className="text-xs text-blue-600">Average Occupancy</div>
        </div>
        <div className="bg-red-50 p-2 rounded">
          <div className="text-xl font-bold text-red-700">{data.peakOccupancy}%</div>
          <div className="text-xs text-red-600">Peak Occupancy</div>
        </div>
        <div className="bg-green-50 p-2 rounded">
          <div className="text-xl font-bold text-green-700">{data.turnoverRate}</div>
          <div className="text-xs text-green-600">Turnover Rate (days)</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Bed Status Distribution */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Bed Status</h4>
          <div className="h-36">
            {data.bedStatusDistribution && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.bedStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {data.bedStatusDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.status]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} beds (${props.payload.percentage}%)`, 
                      props.payload.status
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        {/* Occupancy Trend */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Occupancy Trend</h4>
          <div className="h-36">
            {data.occupancyTrend && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={data.occupancyTrend}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate} 
                    tick={{ fontSize: 10 }}
                    interval="preserveEnd" 
                  />
                  <YAxis domain={[50, 100]} hide />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Occupancy']}
                    labelFormatter={(label) => formatDate(label)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="occupancy" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      
      {/* Department with Highest Occupancy */}
      {data.occupancyByDepartment && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Department Occupancy</h4>
          <div className="grid grid-cols-2 gap-1">
            {data.occupancyByDepartment
              .sort((a, b) => b.occupancy - a.occupancy)
              .slice(0, 4)
              .map((dept, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded text-white text-xs flex justify-between ${
                    dept.occupancy > 85 ? 'bg-red-500' :
                    dept.occupancy > 75 ? 'bg-orange-500' :
                    dept.occupancy > 65 ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}
                >
                  <span>{dept.department}</span>
                  <span>{dept.occupancy}%</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
      
      {/* Alerts/Recommendations */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Alerts</h4>
        <div className="text-xs space-y-1">
          {data.averageOccupancy > 80 && (
            <div className="text-red-600">
              • High overall occupancy at {data.averageOccupancy}%
            </div>
          )}
          
          {data.occupancyByDepartment && 
           data.occupancyByDepartment.some(dept => dept.occupancy > 85) && (
            <div className="text-orange-600">
              • {data.occupancyByDepartment.filter(dept => dept.occupancy > 85).length} department(s) over 85% capacity
            </div>
          )}
          
          {data.maintenanceBeds > 5 && (
            <div className="text-blue-600">
              • {data.maintenanceBeds} beds ({Math.round((data.maintenanceBeds / data.totalBeds) * 100)}%) in maintenance
            </div>
          )}
        </div>
      </div>
      
      <button 
        className="mt-2 text-blue-600 text-sm hover:text-blue-800 flex items-center"
        onClick={onViewFullReport}
      >
        View Full Report
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 ml-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </button>
    </div>
  );
};

export default BedOccupancyDashboardWidget;