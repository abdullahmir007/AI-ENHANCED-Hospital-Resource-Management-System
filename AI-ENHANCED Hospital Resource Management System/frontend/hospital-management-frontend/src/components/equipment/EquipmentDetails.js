import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEquipmentById, updateUsageStatus } from '../../services/equipmentService';
import { toast } from 'react-toastify';

const EquipmentDetails = () => {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await getEquipmentById(id);
      setEquipment(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching equipment details:', err);
      setError('Failed to load equipment details. Please try again.');
      setLoading(false);
      toast.error('Error loading equipment details');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const statusData = {
        status: newStatus,
        notes: `Status changed to ${newStatus} on ${new Date().toLocaleString()}`
      };
      
      // If changing to "In Use", add additional data
      if (newStatus === 'In Use') {
        statusData.patient = 'Emergency Patient';
        statusData.department = equipment.location.ward;
        statusData.assignedBy = 'Current User'; // Replace with actual user name from auth context
      }

      await updateUsageStatus(id, statusData);
      toast.success(`Equipment status updated to ${newStatus}`);
      fetchEquipment(); // Refresh data
    } catch (err) {
      console.error('Error updating equipment status:', err);
      toast.error('Failed to update equipment status');
    }
  };

  const handleEdit = () => {
    navigate(`/equipment/${id}/edit`);
  };

  const handleScheduleMaintenance = () => {
    navigate(`/equipment/maintenance/schedule/${id}`);
  };

  const handleBack = () => {
    navigate('/equipment');
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Available': 'green',
      'In Use': 'blue',
      'Maintenance': 'yellow',
      'Out of Order': 'red'
    };
    return statusColors[status] || 'gray';
  };

  const getConditionColor = (condition) => {
    const conditionColors = {
      'Excellent': 'green',
      'Good': 'blue',
      'Fair': 'yellow',
      'Poor': 'red'
    };
    return conditionColors[condition] || 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Equipment not found'}
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleBack}
        >
          Back to Equipment List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Equipment Details</h1>
        <div className="space-x-2">
          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
            onClick={handleScheduleMaintenance}
          >
            Schedule Maintenance
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            onClick={handleBack}
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Basic Information Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Equipment ID</p>
              <p className="font-medium">{equipment.equipmentId}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{equipment.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">{equipment.category}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Manufacturer</p>
              <p className="font-medium">{equipment.manufacturer}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Model</p>
              <p className="font-medium">{equipment.model}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Serial Number</p>
              <p className="font-medium">{equipment.serialNumber}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-sm">{equipment.description}</p>
            </div>
          </div>
        </div>
        
        {/* Status Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Status & Location</h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <span 
                className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(equipment.status)}-100 text-${getStatusColor(equipment.status)}-800`}
              >
                {equipment.status}
              </span>
            </div>
            
            <div className="mt-2">
              <p className="text-sm text-gray-500">Change Status</p>
              <div className="flex mt-1 space-x-2">
                <button 
                  onClick={() => handleStatusChange('Available')}
                  className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                  disabled={equipment.status === 'Available'}
                >
                  Available
                </button>
                <button 
                  onClick={() => handleStatusChange('In Use')}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  disabled={equipment.status === 'In Use'}
                >
                  In Use
                </button>
                <button 
                  onClick={() => handleStatusChange('Maintenance')}
                  className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                  disabled={equipment.status === 'Maintenance'}
                >
                  Maintenance
                </button>
              </div>
            </div>
            
            <div className="mt-3">
              <p className="text-sm text-gray-500">Condition</p>
              <span className={`text-${getConditionColor(equipment.condition)}-600 font-medium`}>
                {equipment.condition}
              </span>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">
                {equipment.location.building && `${equipment.location.building} Building, `}
                {equipment.location.floor && `Floor ${equipment.location.floor}, `}
                {equipment.location.ward} Ward, Room {equipment.location.room}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Last Maintenance</p>
              <p className="font-medium">{equipment.lastMaintenance ? new Date(equipment.lastMaintenance).toLocaleDateString() : 'Not available'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Next Scheduled Maintenance</p>
              <p className="font-medium">{equipment.nextMaintenance ? new Date(equipment.nextMaintenance).toLocaleDateString() : 'Not scheduled'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Purchase Date</p>
              <p className="font-medium">{new Date(equipment.purchaseDate).toLocaleDateString()}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Warranty Expiration</p>
              <p className="font-medium">{equipment.warrantyExpiration ? new Date(equipment.warrantyExpiration).toLocaleDateString() : 'Not available'}</p>
            </div>
          </div>
        </div>
        
        {/* Technical Specifications Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Technical Specifications</h2>
          
          <div className="space-y-3">
            {equipment.specifications && Object.entries(equipment.specifications).map(([key, value]) => (
              key !== '_id' && (
                <div key={key}>
                  <p className="text-sm text-gray-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                  <p className="font-medium">{value}</p>
                </div>
              )
            ))}
            
            {equipment.status === 'In Use' && equipment.usageLog && equipment.usageLog.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-2">Current Assignment</h3>
                <div className="bg-blue-50 p-3 rounded">
                  <p><span className="text-gray-600">Patient:</span> {equipment.usageLog[0].patient}</p>
                  <p><span className="text-gray-600">Since:</span> {new Date(equipment.usageLog[0].startDate).toLocaleDateString()}</p>
                  <p><span className="text-gray-600">Department:</span> {equipment.usageLog[0].department}</p>
                  <p><span className="text-gray-600">Assigned by:</span> {equipment.usageLog[0].assignedBy}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Maintenance History */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Maintenance History</h2>
        
        {equipment.maintenanceHistory && equipment.maintenanceHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipment.maintenanceHistory.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.type === 'Preventive' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.technician}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.notes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${record.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No maintenance history available.</p>
        )}
      </div>

      {/* Usage History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Usage History</h2>
        
        {equipment.usageLog && equipment.usageLog.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipment.usageLog.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.endDate ? new Date(record.endDate).toLocaleDateString() : 'Current'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.patient}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.assignedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No usage history available.</p>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetails;