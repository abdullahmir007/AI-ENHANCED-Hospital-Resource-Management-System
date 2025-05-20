// File: components/ai-analytics/tabs/AnomalyDetectionTab.js
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const AnomalyDetectionTab = ({ anomalyData }) => {
  const [selectedCategory, setSelectedCategory] = useState('resource');
  const [timeRange, setTimeRange] = useState('7days');
  
  // Check if we have valid data
  if (!anomalyData || !anomalyData.resource) {
    return <div className="p-6 bg-white rounded-lg shadow-md">No anomaly detection data available</div>;
  }
  
  // Helper function to format timestamp
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return dateStr.includes('T') 
      ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : dateStr;
  };
  
  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <label className="text-gray-700 mr-2">Time Range:</label>
            <select 
              className="border rounded-md p-2"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button 
              className={`px-4 py-2 rounded-md ${selectedCategory === 'resource' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
              onClick={() => setSelectedCategory('resource')}
            >
              Resources
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${selectedCategory === 'patient' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
              onClick={() => setSelectedCategory('patient')}
            >
              Patient Care
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${selectedCategory === 'financial' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
              onClick={() => setSelectedCategory('financial')}
            >
              Financial
            </button>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">
          {selectedCategory === 'resource' ? 'Resource Usage Anomalies' :
           selectedCategory === 'patient' ? 'Patient Care Anomalies' :
           'Financial Anomalies'}
        </h3>
        <p className="text-gray-600 mb-4">
          {selectedCategory === 'resource' ? 'Detection of unusual patterns in hospital resource utilization' :
           selectedCategory === 'patient' ? 'Detection of unusual patterns in patient care metrics' :
           'Detection of unusual patterns in financial and billing metrics'}
        </p>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={anomalyData[selectedCategory]?.chartData || []}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <ReferenceLine y={
                anomalyData[selectedCategory]?.chartData?.[0]?.normal * 1.2 || 0
              } stroke="red" strokeDasharray="3 3" label="Anomaly Threshold" />
              <Line 
                type="monotone" 
                dataKey="normal" 
                name="Expected Range" 
                stroke="#64748b" 
                strokeWidth={2} 
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                name="Actual Values" 
                stroke="#3b82f6"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.anomaly) {
                    return (
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={6} 
                        fill="#ef4444" 
                        stroke="white" 
                        strokeWidth={2} 
                      />
                    );
                  }
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={4} 
                      fill="#3b82f6" 
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-3 flex items-center justify-end text-sm">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Normal data point</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>Anomaly detected</span>
          </div>
        </div>
      </div>
      
      {/* Detected anomalies list */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Detected Anomalies</h3>
        
        <div className="space-y-4">
          {/* Show message if no anomalies detected */}
          {anomalyData[selectedCategory]?.anomalies === 0 && (
            <div className="bg-green-50 p-4 rounded-md text-green-800">
              No anomalies detected in this category for the selected time period.
            </div>
          )}
          
          {/* Example anomalies - in a real implementation, you would render actual anomalies from your data */}
          {selectedCategory === 'resource' && anomalyData.resource.anomalies > 0 && (
            <>
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r">
                <div className="flex justify-between">
                  <h4 className="font-medium">Abnormal Bed Occupancy</h4>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-800">
                    Critical
                  </span>
                </div>
                <p className="text-gray-700 mt-1">Bed occupancy reached 102%, 26.5% above normal pattern</p>
                <div className="mt-2 text-sm text-gray-500 flex flex-wrap justify-between">
                  <span>Related to: Bed Allocation</span>
                  <span>Detected: {formatDate("2025-04-21")}</span>
                </div>
                <div className="mt-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4 focus:outline-none">
                    Investigate
                  </button>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none">
                    Mark as Reviewed
                  </button>
                </div>
              </div>
              
              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r">
                <div className="flex justify-between">
                  <h4 className="font-medium">Staff Utilization Spike</h4>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                    Warning
                  </span>
                </div>
                <p className="text-gray-700 mt-1">Staff utilization reached 108.8%, 28.8% above normal pattern</p>
                <div className="mt-2 text-sm text-gray-500 flex flex-wrap justify-between">
                  <span>Related to: Staff Scheduling</span>
                  <span>Detected: {formatDate("2025-04-21")}</span>
                </div>
                <div className="mt-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4 focus:outline-none">
                    Investigate
                  </button>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none">
                    Mark as Reviewed
                  </button>
                </div>
              </div>
            </>
          )}
          
          {selectedCategory === 'financial' && anomalyData.financial.anomalies > 0 && (
            <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r">
              <div className="flex justify-between">
                <h4 className="font-medium">Daily Expense Variation</h4>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  Warning
                </span>
              </div>
              <p className="text-gray-700 mt-1">Daily expenses showed unusual pattern, varying by 25.8% from expected values</p>
              <div className="mt-2 text-sm text-gray-500 flex flex-wrap justify-between">
                <span>Related to: Financial Operations</span>
                <span>Detected: {formatDate("2025-04-20")}</span>
              </div>
              <div className="mt-3">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4 focus:outline-none">
                  Investigate
                </button>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none">
                  Mark as Reviewed
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Configure Alert Settings
        </button>
        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
          Export Anomaly Report
        </button>
      </div>
    </div>
  );
};

export default AnomalyDetectionTab;