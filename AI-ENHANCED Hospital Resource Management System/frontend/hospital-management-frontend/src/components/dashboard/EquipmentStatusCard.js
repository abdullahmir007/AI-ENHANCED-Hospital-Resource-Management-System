import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEquipmentStats } from '../../services/equipmentService';

const EquipmentStatusCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState({
    critical: { total: 0, inUse: 0, available: 0, maintenance: 0 },
    imaging: { total: 0, inUse: 0, available: 0, maintenance: 0 },
    monitoring: { total: 0, inUse: 0, available: 0, maintenance: 0 },
  });
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchEquipmentStats();
  }, []);
  
  const fetchEquipmentStats = async () => {
    try {
      setLoading(true);
      const response = await getEquipmentStats();
      setStats(response.data.data);
      
      // Process category statistics
      const byCategory = response.data.data.byCategory || {};
      const processedStats = {
        critical: byCategory.Critical || { total: 0, inUse: 0, available: 0, maintenance: 0 },
        imaging: byCategory.Imaging || { total: 0, inUse: 0, available: 0, maintenance: 0 },
        monitoring: byCategory.Monitoring || { total: 0, inUse: 0, available: 0, maintenance: 0 },
      };
      
      setCategoryStats(processedStats);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching equipment stats:', err);
      setError('Failed to load equipment statistics');
      setLoading(false);
    }
  };
  
  const getUtilizationRate = (category) => {
    if (!categoryStats[category] || categoryStats[category].total === 0) return 0;
    return Math.round((categoryStats[category].inUse / categoryStats[category].total) * 100);
  };
  
  const getStatusColor = (rate) => {
    if (rate > 85) return 'red';
    if (rate > 70) return 'yellow';
    return 'green';
  };
  
  const handleManageEquipmentClick = () => {
    navigate('/equipment');
  };
  
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md min-h-[300px] flex items-center justify-center">
        <div className="text-gray-500">Loading equipment status data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md">
        <div className="text-red-500">{error}</div>
        <button 
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => fetchEquipmentStats()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Find a maintenance alert if available
  const maintenanceAlert = stats && stats.equipmentRequiringMaintenance && stats.equipmentRequiringMaintenance.length > 0 
    ? stats.equipmentRequiringMaintenance[0] 
    : null;
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-blue-800">Equipment Status</h3>
        <span className="text-gray-400 cursor-pointer">⋮</span>
      </div>
      
      {/* Critical Equipment */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full bg-${getStatusColor(getUtilizationRate('critical'))}-500 mr-2`}></div>
            <span>Critical Equipment</span>
          </div>
          <span className={`text-${getStatusColor(getUtilizationRate('critical'))}-500 font-medium`}>
            {getUtilizationRate('critical')}% in use
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${getStatusColor(getUtilizationRate('critical'))}-500 h-2 rounded-full`} 
            style={{ width: `${getUtilizationRate('critical')}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Available: {categoryStats.critical.available}</span>
          <span>Maintenance: {categoryStats.critical.maintenance}</span>
        </div>
      </div>
      
      {/* Imaging Equipment */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full bg-${getStatusColor(getUtilizationRate('imaging'))}-500 mr-2`}></div>
            <span>Imaging Equipment</span>
          </div>
          <span className={`text-${getStatusColor(getUtilizationRate('imaging'))}-500 font-medium`}>
            {getUtilizationRate('imaging')}% in use
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${getStatusColor(getUtilizationRate('imaging'))}-500 h-2 rounded-full`} 
            style={{ width: `${getUtilizationRate('imaging')}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Available: {categoryStats.imaging.available}</span>
          <span>Maintenance: {categoryStats.imaging.maintenance}</span>
        </div>
      </div>
      
      {/* Monitoring Equipment */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full bg-${getStatusColor(getUtilizationRate('monitoring'))}-500 mr-2`}></div>
            <span>Monitoring Equipment</span>
          </div>
          <span className={`text-${getStatusColor(getUtilizationRate('monitoring'))}-500 font-medium`}>
            {getUtilizationRate('monitoring')}% in use
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${getStatusColor(getUtilizationRate('monitoring'))}-500 h-2 rounded-full`} 
            style={{ width: `${getUtilizationRate('monitoring')}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Available: {categoryStats.monitoring.available}</span>
          <span>Maintenance: {categoryStats.monitoring.maintenance}</span>
        </div>
      </div>
      
      {maintenanceAlert && (
        <div className="mt-4 text-sm bg-yellow-50 p-3 rounded text-yellow-800">
          <strong>Maintenance Alert:</strong> {maintenanceAlert.name} scheduled for maintenance on {new Date(maintenanceAlert.nextMaintenance).toLocaleDateString()}.
        </div>
      )}
      
      {!maintenanceAlert && stats && stats.maintenanceAlert && (
        <div className="mt-4 text-sm bg-yellow-50 p-3 rounded text-yellow-800">
          <strong>Maintenance Alert:</strong> {stats.maintenanceAlert}
        </div>
      )}
      
      <button 
        className="bg-blue-800 text-white py-2 px-4 rounded w-full mt-4 hover:bg-blue-900"
        onClick={handleManageEquipmentClick}
      >
        Manage Equipment
      </button>
    </div>
  );
};

export default EquipmentStatusCard;