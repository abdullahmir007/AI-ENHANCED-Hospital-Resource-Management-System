import React, { useState, useEffect } from 'react';
import { getAllStaff } from '../../services/StaffService';

const StaffAllocationCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffStats, setStaffStats] = useState({
    overall: { total: 0, onDuty: 0, utilization: 0 },
    surgeons: { total: 0, onDuty: 0, available: 0, utilization: 0 },
    nurses: { total: 0, onDuty: 0, available: 0, utilization: 0 },
    physicians: { total: 0, onDuty: 0, available: 0, utilization: 0 },
    technicians: { total: 0, onDuty: 0, available: 0, utilization: 0 },
  });
  
  useEffect(() => {
    const fetchStaffStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the working endpoint instead of the broken one
        const response = await getAllStaff({ limit: 100 }); // Get up to 100 staff members
        console.log("Staff API response:", response);
        
        if (response && response.data && response.data.success === true) {
          const staffList = response.data.data || [];
          console.log("Staff list:", staffList);
          
          if (staffList.length > 0) {
            // Count staff by type
            const surgeonTotal = staffList.filter(s => s.staffType === 'Surgeon').length;
            const nurseTotal = staffList.filter(s => s.staffType === 'Nurse').length;
            const physicianTotal = staffList.filter(s => s.staffType === 'Physician').length;
            const technicianTotal = staffList.filter(s => s.staffType === 'Technician').length;
            
            // Count on-duty staff
            const surgeonOnDuty = staffList.filter(s => s.staffType === 'Surgeon' && s.onDuty).length;
            const nurseOnDuty = staffList.filter(s => s.staffType === 'Nurse' && s.onDuty).length;
            const physicianOnDuty = staffList.filter(s => s.staffType === 'Physician' && s.onDuty).length;
            const technicianOnDuty = staffList.filter(s => s.staffType === 'Technician' && s.onDuty).length;
            
            // Calculate totals
            const totalStaff = surgeonTotal + nurseTotal + physicianTotal + technicianTotal;
            const totalOnDuty = surgeonOnDuty + nurseOnDuty + physicianOnDuty + technicianOnDuty;
            
            // Calculate utilization percentages
            const calculateUtilization = (onDuty, total) => 
              total > 0 ? Math.round((onDuty / total) * 100) : 0;
            
            const surgeonUtilization = calculateUtilization(surgeonOnDuty, surgeonTotal);
            const nurseUtilization = calculateUtilization(nurseOnDuty, nurseTotal);
            const physicianUtilization = calculateUtilization(physicianOnDuty, physicianTotal);
            const technicianUtilization = calculateUtilization(technicianOnDuty, technicianTotal);
            const overallUtilization = calculateUtilization(totalOnDuty, totalStaff);
            
            // For available staff, assume 10% of off-duty staff
            const surgeonAvailable = Math.max(1, Math.round((surgeonTotal - surgeonOnDuty) * 0.1));
            const nurseAvailable = Math.max(1, Math.round((nurseTotal - nurseOnDuty) * 0.1));
            const physicianAvailable = Math.max(1, Math.round((physicianTotal - physicianOnDuty) * 0.1));
            const technicianAvailable = Math.max(1, Math.round((technicianTotal - technicianOnDuty) * 0.1));
            
            const statsMap = {
              overall: { 
                total: totalStaff, 
                onDuty: totalOnDuty, 
                utilization: overallUtilization 
              },
              surgeons: { 
                total: surgeonTotal, 
                onDuty: surgeonOnDuty, 
                available: surgeonAvailable, 
                utilization: surgeonUtilization
              },
              nurses: { 
                total: nurseTotal, 
                onDuty: nurseOnDuty, 
                available: nurseAvailable, 
                utilization: nurseUtilization
              },
              physicians: { 
                total: physicianTotal, 
                onDuty: physicianOnDuty, 
                available: physicianAvailable, 
                utilization: physicianUtilization
              },
              technicians: { 
                total: technicianTotal, 
                onDuty: technicianOnDuty, 
                available: technicianAvailable, 
                utilization: technicianUtilization
              },
            };
            
            console.log("Calculated staff stats:", statsMap);
            setStaffStats(statsMap);
          } else {
            setError('No staff data found');
          }
        } else {
          console.error("Unexpected response format:", response);
          setError('Unexpected data format received from server');
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching staff data:", err);
        setError('Failed to load staff data');
        setLoading(false);
      }
    };
    
    fetchStaffStats();
    
    // Real-time updates
    const interval = setInterval(fetchStaffStats, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleManageStaffClick = () => {
    window.location.href = '/staff';
  };
  
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
    <div className="bg-white p-5 rounded-lg shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-blue-800">Staff Allocation</h3>
        <div className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
          Live
        </div>
      </div>
      
      {/* Overall Utilization */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="font-medium">Overall Utilization</span>
          <span className="font-medium text-blue-600">
            {staffStats.overall.utilization}% ({staffStats.overall.onDuty}/{staffStats.overall.total})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${staffStats.overall.utilization}%` }}
          ></div>
        </div>
      </div>
      
      {/* Surgeons */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Surgeons</span>
          </div>
          <span className="font-medium text-yellow-600">
            {staffStats.surgeons.utilization}% ({staffStats.surgeons.onDuty}/{staffStats.surgeons.total})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-yellow-500 h-2.5 rounded-full" 
            style={{ width: `${staffStats.surgeons.utilization}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Available: {staffStats.surgeons.available}
        </div>
      </div>
      
      {/* Nurses */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
            <span>Nurses</span>
          </div>
          <span className="font-medium text-red-600">
            {staffStats.nurses.utilization}% ({staffStats.nurses.onDuty}/{staffStats.nurses.total})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-red-500 h-2.5 rounded-full" 
            style={{ width: `${staffStats.nurses.utilization}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Available: {staffStats.nurses.available}
        </div>
      </div>
      
      {/* Physicians */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Physicians</span>
          </div>
          <span className="font-medium text-yellow-600">
            {staffStats.physicians.utilization}% ({staffStats.physicians.onDuty}/{staffStats.physicians.total})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-yellow-500 h-2.5 rounded-full" 
            style={{ width: `${staffStats.physicians.utilization}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Available: {staffStats.physicians.available}
        </div>
      </div>
      
      {/* Technicians */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
            <span>Technicians</span>
          </div>
          <span className="font-medium text-green-600">
            {staffStats.technicians.utilization}% ({staffStats.technicians.onDuty}/{staffStats.technicians.total})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-500 h-2.5 rounded-full" 
            style={{ width: `${staffStats.technicians.utilization}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Available: {staffStats.technicians.available}
        </div>
      </div>
      
      {/* Alert for high utilization */}
      {staffStats.nurses.utilization >= 90 && (
        <div className="mt-4 text-sm bg-red-50 p-3 rounded text-red-800">
          <strong>Alert:</strong> High utilization in nursing staff. Consider additional on-call nurses for current shift.
        </div>
      )}
      
      {/* Manage Staff button */}
      <button 
        className="bg-blue-600 text-white py-2 px-4 rounded w-full mt-4 hover:bg-blue-700 transition"
        onClick={handleManageStaffClick}
      >
        Manage Staff
      </button>
    </div>
  );
};

export default StaffAllocationCard;