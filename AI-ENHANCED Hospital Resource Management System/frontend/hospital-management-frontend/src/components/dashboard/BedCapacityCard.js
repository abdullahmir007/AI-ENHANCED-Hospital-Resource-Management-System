import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBedStats } from '../../services/bedService';

const BedCapacityCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bedStats, setBedStats] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    occupancyRate: 0,
    byWard: {}
  });
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBedStats = async () => {
      try {
        setLoading(true);
        const response = await getBedStats();
        const data = response.data.data;
        
        // Ensure we have the expected data structure
        if (data && data.byWard) {
          setBedStats(data);
        } else {
          console.error('Unexpected data structure:', data);
          setError('Received invalid data format');
        }
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
      <div className="bg-white p-5 rounded-lg shadow-md min-h-[300px]">
        <h3 className="font-bold text-lg text-blue-800 mb-4">Bed Capacity</h3>
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
    <div className="bg-white p-5 rounded-lg shadow-md min-h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-blue-800">Bed Capacity</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {bedStats.total} Total Beds
        </span>
      </div>
      
      {/* Overall capacity */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full bg-${getStatusColor(bedStats.occupancyRate)}-500 mr-2`}></div>
            <span>Overall</span>
          </div>
          <span className={`text-${getStatusColor(bedStats.occupancyRate)}-500 font-medium`}>
            {bedStats.occupancyRate}% ({bedStats.occupied}/{bedStats.total})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${getStatusColor(bedStats.occupancyRate)}-500 h-2 rounded-full`} 
            style={{ width: `${bedStats.occupancyRate}%` }}
          ></div>
        </div>
      </div>
      
      {/* Ward capacities */}
      {Object.entries(bedStats.byWard || {}).map(([ward, stats]) => {
        // Skip if stats is not valid or doesn't have the expected properties
        if (!stats || typeof stats !== 'object' || !('occupancyRate' in stats)) {
          return null;
        }
        
        return (
          <div className="mb-3" key={ward}>
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full bg-${getStatusColor(stats.occupancyRate)}-500 mr-2`}></div>
                <span>{ward}</span>
              </div>
              <span className={`text-${getStatusColor(stats.occupancyRate)}-500 font-medium`}>
                {stats.occupancyRate}% ({stats.occupied}/{stats.total})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-${getStatusColor(stats.occupancyRate)}-500 h-2 rounded-full`} 
                style={{ width: `${stats.occupancyRate}%` }}
              ></div>
            </div>
          </div>
        );
      })}
      
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <div>{bedStats.available || 0} Available</div>
        <div>{bedStats.occupied || 0} Occupied</div>
        {bedStats.maintenance !== undefined && <div>{bedStats.maintenance} Maintenance</div>}
        {bedStats.reserved !== undefined && <div>{bedStats.reserved} Reserved</div>}
      </div>
      
      <button 
        className="bg-blue-800 text-white py-2 px-4 rounded w-full mt-2 hover:bg-blue-900"
        onClick={handleManageBedsClick}
      >
        Manage Beds
      </button>
    </div>
  );
};

export default BedCapacityCard;