import React, { useState, useEffect } from 'react';
import { getAIDashboardData } from '../../services/aiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState('resources');
  const [resourceData, setResourceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching AI dashboard data");
        const response = await getAIDashboardData();
        console.log("Received AI dashboard data:", response);
        
        // Check if we have the expected data structure
        if (response && response.resourceOptimization) {
          setResourceData(response.resourceOptimization);
        } else {
          console.error("Unexpected data format:", response);
          throw new Error("Invalid or missing data from AI service");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading AI dashboard data:", err);
        setError(err.message || "Failed to load resource data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3">Loading resource data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-100 text-red-700 rounded-md shadow">
        <h3 className="text-lg font-semibold mb-2">Error: Failed to load resource data</h3>
        <p className="mb-4">{error}</p>
        <p>Please check your AI service connection and try again.</p>
        <button 
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Safety check for expected data structure
  if (!resourceData || !resourceData.resources) {
    return (
      <div className="p-8 bg-yellow-100 text-yellow-800 rounded-md shadow">
        <h3 className="text-lg font-semibold mb-2">Warning: Invalid data format</h3>
        <p>The AI service returned data in an unexpected format.</p>
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-64">
          {JSON.stringify(resourceData, null, 2)}
        </pre>
        <button 
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const renderResourceSummary = () => {
    const { beds = {}, staff = {}, equipment = {} } = resourceData.resources;
    
    // Check if any resource type is missing key data
    const missingData = !beds.current || !staff.current || !equipment.current;
    
    // Show warning if data is missing
    const warningBanner = missingData && (
      <div className="bg-yellow-100 p-4 rounded-lg mb-6">
        <p className="text-yellow-800">Some resource data is missing. Please check AI service configuration.</p>
      </div>
    );
    
    // Helper function to determine utilization status class
    const getUtilizationClass = (utilization) => {
      if (utilization > 90) return "text-red-600";
      if (utilization > 80) return "text-orange-500";
      if (utilization < 40) return "text-yellow-600";
      return "text-green-600";
    };
    
    return (
      <>
        {warningBanner}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Bed Allocation</h3>
            <div className="text-2xl font-bold">
              {beds.current || 0} beds
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className={`${getUtilizationClass(beds.utilization)}`}>
                Utilization: {beds.utilization || 0}%
              </span>
              <span className="text-gray-500">
                Optimal: {beds.optimal || 0} beds
              </span>
            </div>
            {beds.utilization > 90 && (
              <div className="mt-2 text-xs font-medium text-red-600">
                Critical: High utilization - nearing capacity
              </div>
            )}
            {beds.utilization < 40 && (
              <div className="mt-2 text-xs font-medium text-yellow-600">
                Warning: Low utilization - consider reallocation
              </div>
            )}
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Staff Allocation</h3>
            <div className="text-2xl font-bold">
              {staff.current || 0} staff
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className={`${getUtilizationClass(staff.utilization)}`}>
                Utilization: {staff.utilization || 0}%
              </span>
              <span className="text-gray-500">
                Optimal: {staff.optimal || 0} staff
              </span>
            </div>
            {staff.utilization > 90 && (
              <div className="mt-2 text-xs font-medium text-red-600">
                Critical: Staff overutilization - risk of burnout
              </div>
            )}
            {staff.utilization < 40 && (
              <div className="mt-2 text-xs font-medium text-yellow-600">
                Warning: Staff underutilization - optimize scheduling
              </div>
            )}
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Equipment Usage</h3>
            <div className="text-2xl font-bold">
              {equipment.current || 0} units
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className={`${getUtilizationClass(equipment.utilization)}`}>
                Utilization: {equipment.utilization || 0}%
              </span>
              <span className="text-gray-500">
                Optimal: {equipment.optimal || 0} units
              </span>
            </div>
            {equipment.utilization > 90 && (
              <div className="mt-2 text-xs font-medium text-red-600">
                Critical: Equipment at capacity - potential delays
              </div>
            )}
            {equipment.utilization < 40 && (
              <div className="mt-2 text-xs font-medium text-yellow-600">
                Warning: Equipment underutilization - review allocation
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderBedChart = () => {
    const beds = resourceData.resources.beds || {};
    const chartData = beds.chartData || [];
    
    // Check if we have bed chart data
    if (!chartData || chartData.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Bed Allocation by Ward</h3>
          <p className="text-gray-500">No bed allocation data available</p>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Bed Allocation by Ward</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ward" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" name="Current Allocation" fill="#3b82f6" />
              <Bar dataKey="optimal" name="Optimal Allocation" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderStaffChart = () => {
    const staff = resourceData.resources.staff || {};
    const chartData = staff.chartData || [];
    
    // Check if we have staff chart data
    if (!chartData || chartData.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Staff Allocation by Role</h3>
          <p className="text-gray-500">No staff allocation data available</p>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Staff Allocation by Role</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" name="Current Allocation" fill="#3b82f6" />
              <Bar dataKey="optimal" name="Optimal Allocation" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderEquipmentChart = () => {
    const equipment = resourceData.resources.equipment || {};
    const chartData = equipment.chartData || [];
    
    // Check if we have equipment chart data
    if (!chartData || chartData.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Equipment Allocation by Type</h3>
          <p className="text-gray-500">No equipment allocation data available</p>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Equipment Allocation by Type</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" name="Current Allocation" fill="#3b82f6" />
              <Bar dataKey="optimal" name="Optimal Allocation" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    const recommendations = resourceData.recommendations || [];
    
    if (!recommendations || recommendations.length === 0) {
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Resource Optimization Recommendations</h3>
            <p className="text-gray-500">No optimization recommendations available at this time.</p>
          </div>
        );
      }
   
      // Group recommendations by resource type
      const resourceGroups = {
        'Beds': recommendations.filter(rec => rec.resource === 'Beds'),
        'Staff': recommendations.filter(rec => rec.resource === 'Staff'),
        'Equipment': recommendations.filter(rec => rec.resource === 'Equipment')
      };
   
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Resource Optimization Recommendations</h3>
          
          {Object.entries(resourceGroups).map(([resourceType, recs]) => (
            recs.length > 0 && (
              <div key={resourceType} className="mb-6">
                <h4 className="text-md font-medium mb-3 border-b pb-2">{resourceType} Optimization</h4>
                <div className="space-y-4">
                  {recs.map((rec, index) => (
                    <div key={index} className="border-l-4 border-blue-500 p-4 bg-blue-50 rounded-r">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{rec.recommendation}</h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full 
                          ${rec.impact === 'High' 
                            ? 'bg-red-100 text-red-800' 
                            : rec.impact === 'Medium' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-blue-100 text-blue-800'}`}>
                          {rec.impact} Impact
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{rec.description}</p>
                      <div className="mt-2 text-sm">
                        <span className="text-blue-700 font-medium">Area:</span> {rec.area}
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-blue-700 font-medium">Action Required:</span> {rec.actionRequired}
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                          Apply Recommendation
                        </button>
                        <button className="border border-blue-600 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      );
    };
   
    // Utilization overview section
    const renderUtilizationOverview = () => {
      const { beds = {}, staff = {}, equipment = {} } = resourceData.resources;
      
      // Calculate overall utilization
      const overallUtilization = (
        (beds.utilization || 0) +
        (staff.utilization || 0) +
        (equipment.utilization || 0)
      ) / 3;
      
      // Determine overall status
      let status = "Optimal";
      let statusClass = "text-green-600";
      
      if (overallUtilization > 90) {
        status = "Critical - Over Capacity";
        statusClass = "text-red-600";
      } else if (overallUtilization > 85) {
        status = "High - Near Capacity";
        statusClass = "text-orange-500";
      } else if (overallUtilization < 40) {
        status = "Low - Underutilized";
        statusClass = "text-yellow-600";
      }
      
      return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-2">Resource Utilization Overview</h3>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold">{Math.round(overallUtilization)}%</div>
              <div className="text-gray-500 text-sm">Overall Resource Utilization</div>
            </div>
            <div className={`text-lg font-medium ${statusClass}`}>
              {status}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className={`p-3 rounded-lg border ${getUtilizationColorClass(beds.utilization)}`}>
              <div className="text-lg font-semibold">{beds.utilization || 0}%</div>
              <div className="text-sm">Bed Utilization</div>
            </div>
            <div className={`p-3 rounded-lg border ${getUtilizationColorClass(staff.utilization)}`}>
              <div className="text-lg font-semibold">{staff.utilization || 0}%</div>
              <div className="text-sm">Staff Utilization</div>
            </div>
            <div className={`p-3 rounded-lg border ${getUtilizationColorClass(equipment.utilization)}`}>
              <div className="text-lg font-semibold">{equipment.utilization || 0}%</div>
              <div className="text-sm">Equipment Utilization</div>
            </div>
          </div>
        </div>
      );
    };
    
    // Helper function for utilization colors
    const getUtilizationColorClass = (utilization) => {
      if (utilization > 90) return "border-red-500 bg-red-50";
      if (utilization > 80) return "border-orange-500 bg-orange-50";
      if (utilization < 40) return "border-yellow-500 bg-yellow-50";
      return "border-green-500 bg-green-50";
    };
   
    return (
      <div className="bg-gray-100 p-6">
        <h2 className="text-2xl font-bold mb-6">Hospital Resource Optimization</h2>
        
        {renderUtilizationOverview()}
        {renderResourceSummary()}
        {renderBedChart()}
        {renderStaffChart()}
        {renderEquipmentChart()}
        {renderRecommendations()}
        
        <div className="flex space-x-4 mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Apply All Recommended Changes
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
            Export Optimization Report
          </button>
        </div>
      </div>
    );
   };
   
   export default HospitalDashboard;