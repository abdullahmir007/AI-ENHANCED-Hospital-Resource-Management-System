import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getStaffById, updateStaffSchedule } from '../../services/StaffService';

const StaffScheduleAssign = ({ bulkMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dateParam = searchParams.get('date');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staff, setStaff] = useState(null);
  const [formData, setFormData] = useState({
    date: dateParam || new Date().toISOString().split('T')[0],
    assignment: '',
    shift: '',
    startTime: '',
    endTime: '',
    notes: ''
  });
  
  const [bulkStaff, setBulkStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!bulkMode && id) {
          // Fetch individual staff details
          const response = await getStaffById(id);
          setStaff(response.data.data);
          
          // If we have a date parameter, check if there's an existing assignment
          if (dateParam) {
            const existingShift = response.data.data.schedule?.find(
              s => s.date === dateParam
            );
            
            if (existingShift) {
              setFormData({
                date: dateParam,
                assignment: existingShift.assignment || '',
                shift: existingShift.shift || '',
                startTime: existingShift.startTime || '',
                endTime: existingShift.endTime || '',
                notes: existingShift.notes || ''
              });
            }
          }
        } else if (bulkMode) {
          // In bulk mode, we'd fetch all staff
          // Mocked for now
          setBulkStaff([
            { _id: '1', name: 'Dr. John Smith', staffId: 'S001', staffType: 'Surgeon', department: 'Surgery' },
            { _id: '2', name: 'Sarah Johnson', staffId: 'S002', staffType: 'Nurse', department: 'ER' },
            { _id: '3', name: 'Michael Rodriguez', staffId: 'S003', staffType: 'Technician', department: 'Radiology' },
            { _id: '4', name: 'Dr. Emily Chen', staffId: 'S004', staffType: 'Physician', department: 'ICU' },
            { _id: '5', name: 'Robert Williams', staffId: 'S005', staffType: 'Nurse', department: 'Pediatrics' }
          ]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
        console.error('Error loading data:', err);
      }
    };
    
    fetchData();
  }, [id, bulkMode, dateParam]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStaffSelection = (staffId) => {
    setSelectedStaff(prev => {
      if (prev.includes(staffId)) {
        return prev.filter(id => id !== staffId);
      } else {
        return [...prev, staffId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedStaff.length === bulkStaff.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(bulkStaff.map(s => s._id));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (!bulkMode) {
        // Handle single staff assignment
        await updateStaffSchedule(id, {
          shifts: [formData]
        });
        
        navigate(`/staff/${id}/schedule`);
      } else {
        // Handle bulk assignment
        // In a real app, you'd make API calls for each staff member
        alert(`Assigned ${selectedStaff.length} staff members from ${dateRange.startDate} to ${dateRange.endDate}`);
        navigate('/staff/schedule');
      }
    } catch (err) {
      setError('Failed to save schedule');
      setLoading(false);
      console.error('Error saving schedule:', err);
    }
  };
  
  const handleCancel = () => {
    if (!bulkMode && id) {
      navigate(`/staff/${id}/schedule`);
    } else {
      navigate('/staff/schedule');
    }
  };
  
  // Predefined shift types
  const shiftTypes = [
    { value: 'Morning (7AM-3PM)', label: 'Morning (7AM-3PM)' },
    { value: 'Evening (3PM-11PM)', label: 'Evening (3PM-11PM)' },
    { value: 'Night (11PM-7AM)', label: 'Night (11PM-7AM)' },
    { value: 'Custom', label: 'Custom Hours' },
    { value: 'Off', label: 'Day Off' }
  ];
  
  // Predefined assignments
  const assignments = [
    { value: 'ER', label: 'Emergency Room' },
    { value: 'ICU', label: 'Intensive Care' },
    { value: 'General Ward', label: 'General Ward' },
    { value: 'Surgery', label: 'Surgery' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Radiology', label: 'Radiology' },
    { value: 'Off', label: 'Off Duty' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {bulkMode ? 'Bulk Schedule Assignment' : `Assign Schedule: ${staff?.name || ''}`}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          {bulkMode ? (
            <>
              {/* Bulk Assignment Form */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">1. Select Date Range</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date*
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={dateRange.startDate}
                      onChange={handleDateRangeChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date*
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={dateRange.endDate}
                      onChange={handleDateRangeChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">2. Select Staff Members</h2>
                <div className="mb-2 flex justify-between items-center">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={handleSelectAll}
                  >
                    {selectedStaff.length === bulkStaff.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedStaff.length} of {bulkStaff.length} selected
                  </span>
                </div>
                
                <div className="bg-gray-50 border rounded-md max-h-60 overflow-y-auto">
                  {bulkStaff.map((staffMember) => (
                    <div 
                      key={staffMember._id}
                      className={`flex items-center p-3 border-b ${
                        selectedStaff.includes(staffMember._id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`staff-${staffMember._id}`}
                        checked={selectedStaff.includes(staffMember._id)}
                        onChange={() => handleStaffSelection(staffMember._id)}
                        className="mr-3 h-5 w-5 text-blue-600"
                      />
                      <label htmlFor={`staff-${staffMember._id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{staffMember.name}</div>
                        <div className="text-sm text-gray-500">
                          {staffMember.staffType} • {staffMember.department}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">3. Define Schedule</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment*
                    </label>
                    <select
                      name="assignment"
                      value={formData.assignment}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Assignment</option>
                      {assignments.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shift*
                    </label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Shift</option>
                      {shiftTypes.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {formData.shift === 'Custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any additional notes..."
                  ></textarea>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-yellow-50 text-yellow-800 rounded-lg mb-6">
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>
                  This will assign {selectedStaff.length} staff members to the selected schedule for {
                    Math.round((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24) + 1)
                  } days. Please review carefully.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Individual Staff Assignment Form */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Schedule Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date*
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment*
                    </label>
                    <select
                      name="assignment"
                      value={formData.assignment}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Assignment</option>
                      {assignments.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shift*
                    </label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Shift</option>
                      {shiftTypes.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {formData.shift === 'Custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any additional notes..."
                  ></textarea>
                </div>
              </div>
              
              {staff && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Staff Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 block">Name:</span>
                      <span className="font-medium">{staff.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Role:</span>
                      <span className="font-medium">{staff.staffType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Department:</span>
                      <span className="font-medium">{staff.department}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              disabled={loading || (bulkMode && selectedStaff.length === 0)}
            >
              {loading ? 'Saving...' : bulkMode ? 'Assign Selected Staff' : 'Save Schedule'}
            </button>
            <button
              type="button"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffScheduleAssign;