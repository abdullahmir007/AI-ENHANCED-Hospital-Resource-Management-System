import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBedById, releaseBed } from '../../services/bedService';

const BedDetails = () => {
  const [bed, setBed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBedDetails = async () => {
      try {
        setLoading(true);
        const response = await getBedById(id);
        setBed(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bed details');
        setLoading(false);
        console.error('Error fetching bed details:', err);
      }
    };

    fetchBedDetails();
  }, [id]);

  const handleEdit = () => {
    navigate(`/beds/${id}/edit`);
  };

  const handleRelease = async () => {
    if (!window.confirm('Are you sure you want to release this bed?')) return;
    
    try {
      await releaseBed(id);
      // Refresh bed data
      const response = await getBedById(id);
      setBed(response.data.data);
    } catch (err) {
      setError('Failed to release bed');
      console.error('Error releasing bed:', err);
    }
  };

  const handleBack = () => {
    navigate('/beds');
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Available': 'green',
      'Occupied': 'red',
      'Reserved': 'yellow',
      'Maintenance': 'gray'
    };
    return statusColors[status] || 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !bed) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Bed not found'}
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleBack}
        >
          Back to Bed List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bed Details</h1>
        <div className="space-x-2">
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

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Bed Information</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Bed ID</p>
                <p className="font-medium">{bed.bedId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(bed.status)}-100 text-${getStatusColor(bed.status)}-800`}
                >
                  {bed.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Ward</p>
                <p className="font-medium">{bed.ward}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{bed.type || 'Standard'}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">
                {bed.location?.building || ''}, Floor {bed.location?.floor || ''}, 
                Room {bed.location?.roomNumber || ''}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Last Sanitized</p>
                <p className="font-medium">
                  {new Date(bed.lastSanitized).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Maintained</p>
                <p className="font-medium">
                  {bed.lastMaintenance ? new Date(bed.lastMaintenance).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Current Assignment</h2>
            
            {bed.status === 'Occupied' && bed.currentPatient ? (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Patient Name</p>
                  <p className="font-medium">{bed.currentPatient.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Patient ID</p>
                    <p className="font-medium">{bed.currentPatient.patientId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age/Gender</p>
                    <p className="font-medium">
                      {bed.currentPatient.age}, {bed.currentPatient.gender}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Diagnosis</p>
                  <p className="font-medium">{bed.currentPatient.diagnosis || 'N/A'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Admission Date</p>
                    <p className="font-medium">
                      {new Date(bed.currentPatient.admissionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected Discharge</p>
                    <p className="font-medium">
                      {bed.currentPatient.expectedDischarge 
                        ? new Date(bed.currentPatient.expectedDischarge).toLocaleDateString() 
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 w-full"
                  onClick={handleRelease}
                >
                  Release Bed
                </button>
              </div>
            ) : bed.status === 'Reserved' ? (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Reserved For</p>
                  <p className="font-medium">{bed.reservedFor?.name || 'Unknown'}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Reservation Time</p>
                  <p className="font-medium">
                    {bed.reservationTime ? new Date(bed.reservationTime).toLocaleString() : 'N/A'}
                  </p>
                </div>
                
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 w-full"
                  onClick={handleRelease}
                >
                  Cancel Reservation
                </button>
              </div>
            ) : bed.status === 'Maintenance' ? (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Maintenance Reason</p>
                  <p className="font-medium">{bed.maintenanceReason || 'Scheduled maintenance'}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Expected Completion</p>
                  <p className="font-medium">
                    {bed.maintenanceEndTime 
                      ? new Date(bed.maintenanceEndTime).toLocaleString() 
                      : 'Not specified'}
                  </p>
                </div>
                
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full"
                  onClick={handleRelease}
                >
                  Mark as Available
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-green-600 font-medium mb-2">
                    This bed is currently available
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    You can assign this bed to a patient or reserve it for upcoming admission.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
                    onClick={() => navigate(`/patients/assign-bed/${id}`)}
                  >
                    Assign to Patient
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 w-full"
                    onClick={() => navigate(`/beds/${id}/reserve`)}
                  >
                    Reserve Bed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bed History Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Bed History</h2>
        
        {bed.history && bed.history.length > 0 ? (
          <div className="border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bed.history.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(entry.status)}-100 text-${getStatusColor(entry.status)}-800`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.patientName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {entry.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No history available for this bed</p>
        )}
      </div>
    </div>
  );
};

export default BedDetails;