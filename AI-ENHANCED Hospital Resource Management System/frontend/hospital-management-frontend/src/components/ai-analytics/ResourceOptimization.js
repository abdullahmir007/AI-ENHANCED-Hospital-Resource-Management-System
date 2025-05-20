import React, { useState, useEffect } from 'react';
import { getResourceOptimization } from '../../services/aiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ResourceOptimization = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);
  const [selectedResource, setSelectedResource] = useState('beds');

  useEffect(() => {
    const fetchOptimizationData = async () => {
      try {
        setLoading(true);
        const response = await getResourceOptimization();
        setOptimizationData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Could not load resource optimization data');
        setLoading(false);
        console.error('Error fetching optimization data:', err);
      }
    };

    fetchOptimizationData();
  }, []);

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
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Mock data for development without backend
  const mockData = {
    resources: {
      beds: {
        current: 120,
        optimal: 135,
        utilization: 89,
        recommendations: [
          "Increase ICU bed count by 5 units",
          "Reallocate 3 beds from pediatric ward to general ward",
          "Implement discharge planning improvements to reduce average length of stay"
        ],
        savings: "$230,000 annual cost reduction",
        chartData: [
          { ward: 'ICU', current: 25, optimal: 30 },
          { ward: 'ER', current: 15, optimal: 15 },
          { ward: 'General', current: 60, optimal: 65 },
          { ward: 'Pediatric', current: 20, optimal: 17 },
          { ward: 'Maternity', current: 10, optimal: 8 }
        ]
      },
      staff: {
        current: 87,
        optimal: 92,
        utilization: 94,
        recommendations: [
          "Hire 2 additional nurses for night shift",
          "Cross-train 5 staff members for flexibility between departments",
          "Optimize physician scheduling to reduce overtime"
        ],
        savings: "$180,000 annual savings in overtime reduction",
        chartData: [
          { role: 'Physicians', current: 22, optimal: 22 },
          { role: 'Nurses', current: 35, optimal: 40 },
          { role: 'Technicians', current: 18, optimal: 20 },
          { role: 'Admin', current: 12, optimal: 10 }
        ]
      },
      equipment: {
        current: 65,
        optimal: 58,
        utilization: 72,
        recommendations: [
          "Redistribute ventilators between departments based on usage patterns",
          "Schedule non-emergency MRI scans during off-peak hours",
          "Replace 3 older X-ray machines with 2 modern high-throughput units"
        ],
        savings: "$350,000 in capital expenditure reduction",
        chartData: [
          { type: 'Ventilators', current: 15, optimal: 12 },
          { type: 'MRI', current: 3, optimal: 3 },
          { type: 'X-ray', current: 18, optimal: 14 },
          { type: 'CT Scan', current: 4, optimal: 4 },
          { type: 'Ultrasound', current: 10, optimal: 12 },
          { type: 'Monitoring', current: 15, optimal: 13 }
        ]
      }
    }
  };

  // Use mock data if backend data is not available
  const data = optimizationData || mockData;
  const resourceData = data.resources[selectedResource];

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-2">Resource Optimization</h2>
        <p className="text-gray-600">
          AI analysis of hospital resource allocation to optimize efficiency, reduce costs,
          and improve patient care through data-driven recommendations.
        </p>
      </div>

      {/* Resource selection tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button 
            className={`py-3 px-6 font-medium text-sm ${selectedResource === 'beds' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setSelectedResource('beds')}
          >
            Bed Allocation
          </button>
          <button 
            className={`py-3 px-6 font-medium text-sm ${selectedResource === 'staff' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setSelectedResource('staff')}
          >
            Staff Optimization
          </button>
          <button 
            className={`py-3 px-6 font-medium text-sm ${selectedResource === 'equipment' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setSelectedResource('equipment')}
          >
            Equipment Usage
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Current Resources</h3>
          <div className="text-2xl font-bold">{resourceData.current} units</div>
          <div className="text-xs text-gray-500 mt-1">
            Currently deployed in hospital
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Optimal Resources</h3>
          <div className="text-2xl font-bold">{resourceData.optimal} units</div>
          <div className="text-xs text-gray-500 mt-1">
            AI recommended allocation
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Utilization Rate</h3>
          <div className="text-2xl font-bold">{resourceData.utilization}%</div>
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
              data={resourceData.chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={
                  selectedResource === 'beds' ? 'ward' : 
                  selectedResource === 'staff' ? 'role' : 'type'
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
          {resourceData.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-800">
          <div className="font-medium">Projected Savings</div>
          <div>{resourceData.savings}</div>
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

export default ResourceOptimization;