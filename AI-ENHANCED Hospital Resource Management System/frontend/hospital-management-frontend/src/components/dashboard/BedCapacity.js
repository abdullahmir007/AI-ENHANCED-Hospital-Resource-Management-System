import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBedStats } from '../../services/bedService';

const BedCapacityCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bedStats, setBedStats] = useState({
    icu: { total: 0, occupied: 0, available: 0, occupancyRate: 0 },
    er: { total: 0, occupied: 0, available: 0, occupancyRate: 0 },
    general: { total: 0, occupied: 0, available: 0, occupancyRate: 0 },
    pediatric: { total: 0, occupied: 0, available: 0, occupancyRate: 0 },
  });
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBedStats = async () => {
      try {
        setLoading(true);
        const response = await getBedStats();
        setBedStats({
          icu: response.data.data.byWard.ICU,
          er: response.data.data.byWard.ER,
          general: response.data.data.byWard.General,
          pediatric: response.data.data.byWard.Pediatric,
        });
        setLoading(false);
      } catch (err) {
        setError('Could not load bed capacity data');
        setLoading(false);
        console.error('Error fetching bed stats:', err);
      }
    };
    
    fetchBedStats();
    
    // Set up polling to refresh data
    const interval = setInterval(fetchBedStats, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const getStatusColor = (rate) => {
    if (rate > 90) return 'red';
    if (rate > 75) return 'yellow';
    return 'green';
  };
  
  const handleManageBedsClick = () => {
    navigate('/beds');
  };
  
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md min-h-[300px] flex items-center justify-center">
        <div className="text-gray-500">Loading bed capacity data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md">
        <div className="text-red-500">{error}</div>
        <button 
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-blue-800">Bed Capacity</h3>
        <span className="text-gray-400 cursor-pointer">⋮</span>
      </div>
      
      {/* ICU Beds */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full bg-${getStatusColor(bedStats.icu.occupancyRate)}-500 mr-2`}></div>
            <span>ICU Beds</span>
          </div>
          <span className={`text-${getStatusColor(bedStats.icu.occupancyRate)}-500 font-medium`}>
            {bedStats.icu.occupancyRate}% ({bedStats.icu.occupied}/{bedStats.icu.total})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${getStatusColor(bedStats.icu.occupancyRate)}-500 h-2 rounded-full`} 
            style={{ width: `${bedStats.icu.occupancyRate}%` }}
          ></div>
        </div>
      </div>
      
      {/* ER Beds */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full bg-${getStatusColor(bedStats.er.occupancyRate)}-500 mr-2`}></div>
            <span>ER Beds</span>
          </div>
          <span className={`text-${getStatusColor(bedStats.er.occupancyRate)}-500 font-medium`}>
            {bedStats.er.occupancyRate}% ({bedStats.er.occupied}/{bedStats.er.total})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${getStatusColor(bedStats.er.occupancyRate)}-500 h-2 rounded-full`} 
            style={{ width: `${bedStats.er.occupancyRate}%` }}
          ></div>
        </div>
      </div>
      
      {/* General Ward */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full bg-${getStatusColor(bedStats.general.occupancyRate)}-500 mr-2`}></div>
            <span>General Ward</span>
          </div>
          <span className={`text-${getStatusColor(bedStats.general.occupancyRate)}-500 font-medium`}>
            {bedStats.general.occupancyRate}% ({bedStats.general.occupied}/{bedStats.general.total})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${getStatusColor(bedStats.general.occupancyRate)}-500 h-2 rounded-full`} 
            style={{ width: `${bedStats.general.occupancyRate}%` }}
          ></div>
        </div>
      </div>
      
      {/* Pediatric */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full bg-${getStatusColor(bedStats.pediatric.occupancyRate)}-500 mr-2`}></div>
            <span>Pediatric</span>
          </div>
          <span className={`text-${getStatusColor(bedStats.pediatric.occupancyRate)}-500 font-medium`}>
            {bedStats.pediatric.occupancyRate}% ({bedStats.pediatric.occupied}/{bedStats.pediatric.total})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${getStatusColor(bedStats.pediatric.occupancyRate)}-500 h-2 rounded-full`} 
            style={{ width: `${bedStats.pediatric.occupancyRate}%` }}
          ></div>
        </div>
      </div>
      
      <button 
        className="bg-blue-800 text-white py-2 px-4 rounded w-full mt-4 hover:bg-blue-900"
        onClick={handleManageBedsClick}
      >
        Manage Beds
      </button>
    </div>
  );
};

export default BedCapacityCard;