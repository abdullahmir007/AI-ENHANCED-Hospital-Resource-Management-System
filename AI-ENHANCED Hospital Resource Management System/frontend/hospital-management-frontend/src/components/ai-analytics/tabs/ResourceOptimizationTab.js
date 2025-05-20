// File: components/ai-analytics/tabs/ResourceOptimizationTab.js
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getResourceOptimization } from '../../../services/aiService';

const ResourceOptimizationTab = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resourceData, setResourceData] = useState(null);
  const [activeResource, setActiveResource] = useState('beds');

  useEffect(() => {
    fetchResourceData();
  }, []);

  const fetchResourceData = async () => {
    try {
      setLoading(true);
      const response = await getResourceOptimization();
      console.log('Resource optimization response:', response);
      
      // Check if we have the expected data structure
      if (response && response.resources) {
        setResourceData(response.resources);
        setLoading(false);
      } else {
        console.error('Unexpected data format:', response);
        setError('Received data in an unexpected format. Check console for details.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching resource optimization data:', err);
      setError('Failed to load resource optimization data. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={fetchResourceData}
        >
          Retry
        </button>
      </div>
    );
  }

  // Check if we have valid data
  if (!resourceData || !resourceData.beds) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        No resource optimization data available. Please check the AI service.
      </div>
    );
  }

  const activeData = resourceData[activeResource];

  return (
    <div className="space-y-6">
      {/* Resource type selector */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Resource Type:</h3>
          <div className="flex space-x-2">
            <button 
              className={`px-4 py-2 rounded-md ${activeResource === 'beds' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setActiveResource('beds')}
            >
              Beds
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${activeResource === 'staff' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setActiveResource('staff')}
            >
              Staff
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${activeResource === 'equipment' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setActiveResource('equipment')}
            >
              Equipment
            </button>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Current {activeResource}</h3>
          <div className="text-2xl font-bold">{activeData.current} units</div>
          <div className="text-xs text-gray-500 mt-1">
            Currently deployed in hospital
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Optimal {activeResource}</h3>
          <div className="text-2xl font-bold">{activeData.optimal} units</div>
          <div className="text-xs text-gray-500 mt-1">
            AI recommended allocation
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Utilization Rate</h3>
          <div className="text-2xl font-bold">{activeData.utilization}%</div>
          <div className="text-xs text-gray-500 mt-1">
            Current efficiency rate
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Current vs. Optimal Allocation</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeData.chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={
                  activeResource === 'beds' ? 'ward' : 
                  activeResource === 'staff' ? 'role' : 'type'
                } 
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" name="Current" fill="#3b82f6" />
              <Bar dataKey="optimal" name="Optimal" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
        
        <ul className="space-y-2">
          {activeData.recommendations && activeData.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-800">
          <div className="font-medium">Projected Savings</div>
          <div>${activeData.savings ? activeData.savings.toLocaleString() : 'N/A'}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Apply Recommendations
        </button>
        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
          Download Full Report
        </button>
      </div>
    </div>
  );
};

export default ResourceOptimizationTab;