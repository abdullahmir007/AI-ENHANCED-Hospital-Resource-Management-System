import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStaff, getStaffAvailability } from '../../services/StaffService';

const StaffSchedule = () => {
  const [staff, setStaff] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    staffType: '',
    department: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [currentView, setCurrentView] = useState('day'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch staff list
        const staffResponse = await getAllStaff({ limit: 100 });
        setStaff(staffResponse.data.data);
        
        // Fetch schedule data based on current view and filters
        let dateParams = {};
        if (currentView === 'day') {
          dateParams = { date: currentDate.toISOString().split('T')[0] };
        } else if (currentView === 'week') {
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - currentDate.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          dateParams = {
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0]
          };
        } else if (currentView === 'month') {
          const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          dateParams = {
            startDate: monthStart.toISOString().split('T')[0],
            endDate: monthEnd.toISOString().split('T')[0]
          };
        }
        
        const availabilityResponse = await getStaffAvailability({
          ...filters,
          ...dateParams
        });
        
        setScheduleData(availabilityResponse.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch schedule data');
        setLoading(false);
        console.error('Error fetching schedule data:', err);
      }
    };
    
    fetchData();
  }, [currentView, currentDate, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleViewChange = (view) => {
    setCurrentView(view);
  };
  
  const handleDateChange = (direction) => {
    const newDate = new Date(currentDate);
    
    if (currentView === 'day') {
      newDate.setDate(currentDate.getDate() + direction);
    } else if (currentView === 'week') {
      newDate.setDate(currentDate.getDate() + (7 * direction));
    } else if (currentView === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    }
    
    setCurrentDate(newDate);
  };
  
  const handleStaffClick = (staffId) => {
    navigate(`/staff/${staffId}`);
  };
  
  const handleAssignmentClick = (staffId, date) => {
    navigate(`/staff/${staffId}/schedule/assign?date=${date}`);
  };
  
  const formatDateHeader = () => {
    if (currentView === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (currentView === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };
  
  // Generate array of dates for the current view
  const getDatesForView = () => {
    const dates = [];
    
    if (currentView === 'day') {
      dates.push(new Date(currentDate));
    } else if (currentView === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        dates.push(date);
      }
    } else if (currentView === 'month') {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Add days from previous month to start on Sunday
      const firstDay = monthStart.getDay();
      for (let i = 0; i < firstDay; i++) {
        const date = new Date(monthStart);
        date.setDate(monthStart.getDate() - (firstDay - i));
        dates.push(date);
      }
      
      // Add all days in the current month
      for (let i = 1; i <= monthEnd.getDate(); i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        dates.push(date);
      }
      
      // Add days from next month to end on Saturday
      const lastDay = monthEnd.getDay();
      if (lastDay < 6) {
        for (let i = 1; i <= 6 - lastDay; i++) {
          const date = new Date(monthEnd);
          date.setDate(monthEnd.getDate() + i);
          dates.push(date);
        }
      }
    }
    
    return dates;
  };
  
  // Mock schedule data for development
  const generateMockScheduleData = () => {
    const assignments = ['ER', 'ICU', 'General Ward', 'Surgery', 'Off'];
    const shifts = ['Morning (7AM-3PM)', 'Evening (3PM-11PM)', 'Night (11PM-7AM)', 'Off'];
    
    const mockStaff = [
      { _id: '1', name: 'Dr. John Smith', staffId: 'S001', staffType: 'Surgeon', department: 'Surgery' },
      { _id: '2', name: 'Sarah Johnson', staffId: 'S002', staffType: 'Nurse', department: 'ER' },
      { _id: '3', name: 'Michael Rodriguez', staffId: 'S003', staffType: 'Technician', department: 'Radiology' },
      { _id: '4', name: 'Dr. Emily Chen', staffId: 'S004', staffType: 'Physician', department: 'ICU' },
      { _id: '5', name: 'Robert Williams', staffId: 'S005', staffType: 'Nurse', department: 'Pediatrics' }
    ];
    
    // Generate random schedules for each staff member
    const mockSchedule = [];
    const dates = getDatesForView();
    
    mockStaff.forEach(staffMember => {
      const staffSchedule = {
        staffId: staffMember._id,
        name: staffMember.name,
        staffType: staffMember.staffType,
        department: staffMember.department,
        shifts: []
      };
      
      dates.forEach(date => {
        // Every 7th day is off
        const isOff = date.getDay() === 0 || date.getDay() === 6 || Math.random() > 0.85;
        const assignment = isOff ? 'Off' : assignments[Math.floor(Math.random() * (assignments.length - 1))];
        const shift = isOff ? 'Off' : shifts[Math.floor(Math.random() * (shifts.length - 1))];
        
        staffSchedule.shifts.push({
          date: date.toISOString().split('T')[0],
          assignment,
          shift,
          status: date < new Date() ? 'Completed' : 'Scheduled'
        });
      });
      
      mockSchedule.push(staffSchedule);
    });
    
    return mockSchedule;
  };
  
  const getScheduleForDate = (staffMember, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const staffSchedule = scheduleData.find(s => s.staffId === staffMember._id);
    
    if (staffSchedule) {
      const shift = staffSchedule.shifts.find(s => s.date === dateStr);
      return shift || { date: dateStr, assignment: 'Unassigned', shift: 'Unassigned', status: 'Unassigned' };
    }
    
    return { date: dateStr, assignment: 'Unassigned', shift: 'Unassigned', status: 'Unassigned' };
  };
  
  // Use mock data if API data is not available
  const displayStaff = staff.length > 0 ? staff : generateMockScheduleData().map(s => ({ 
    _id: s.staffId, name: s.name, staffType: s.staffType, department: s.department 
  }));
  
  const displaySchedule = scheduleData.length > 0 ? scheduleData : generateMockScheduleData();
  
  const getShiftColorClass = (shift) => {
    if (!shift || shift.assignment === 'Unassigned') return 'bg-gray-100 text-gray-500';
    if (shift.assignment === 'Off') return 'bg-gray-100 text-gray-500';
    
    if (shift.shift && shift.shift.includes('Morning')) return 'bg-blue-100 text-blue-700';
    if (shift.shift && shift.shift.includes('Evening')) return 'bg-amber-100 text-amber-700';
    if (shift.shift && shift.shift.includes('Night')) return 'bg-indigo-100 text-indigo-700';
    
    return 'bg-green-100 text-green-700';
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Staff Schedule</h1>
        <div className="space-x-2">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            onClick={() => navigate('/staff/schedule/optimize')}
          >
            Optimize Schedule
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => navigate('/staff/schedule/bulk-assign')}
          >
            Bulk Assign
          </button>
        </div>
      </div>
      
      {/* Filters and View Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4">
              <button
                className={`px-3 py-1 rounded-md ${currentView === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleViewChange('day')}
              >
                Day
              </button>
              <button
                className={`px-3 py-1 rounded-md ${currentView === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleViewChange('week')}
              >
                Week
              </button>
              <button
                className={`px-3 py-1 rounded-md ${currentView === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleViewChange('month')}
              >
                Month
              </button>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <div className="flex items-center justify-between">
              <button
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={() => handleDateChange(-1)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-lg font-medium">{formatDateHeader()}</span>
              
              <button
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={() => handleDateChange(1)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
            <select
              name="staffType"
              value={filters.staffType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Surgeon">Surgeon</option>
              <option value="Nurse">Nurse</option>
              <option value="Physician">Physician</option>
              <option value="Technician">Technician</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              <option value="Surgery">Surgery</option>
              <option value="ER">Emergency Room</option>
              <option value="ICU">Intensive Care</option>
              <option value="Radiology">Radiology</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search || ''}
              onChange={handleFilterChange}
              placeholder="Search by name, ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Schedule Grid */}
      <div className="bg-white p-2 rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                Staff
              </th>
              {getDatesForView().map((date, index) => (
                <th 
                  key={index} 
                  className={`p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] ${
                    date.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
                  }`}
                >
                  <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayStaff.map((staffMember) => (
              <tr key={staffMember._id} className="hover:bg-gray-50">
                <td 
                  className="p-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 cursor-pointer hover:text-blue-600"
                  onClick={() => handleStaffClick(staffMember._id)}
                >
                  <div>{staffMember.name}</div>
                  <div className="text-xs text-gray-500">{staffMember.staffType} • {staffMember.department}</div>
                </td>
                {getDatesForView().map((date, index) => {
                  const shift = getScheduleForDate(staffMember, date);
                  return (
                    <td 
                      key={index} 
                      className={`p-3 text-center text-sm cursor-pointer ${
                        date.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleAssignmentClick(staffMember._id, date.toISOString().split('T')[0])}
                    >
                      <div className={`p-2 rounded ${getShiftColorClass(shift)}`}>
                        <div className="font-medium">{shift.assignment}</div>
                        <div className="text-xs">{shift.shift}</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500">Total Staff</div>
          <div className="text-2xl font-bold text-blue-600">{displayStaff.length}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500">On Duty Today</div>
          <div className="text-2xl font-bold text-green-600">
            {displaySchedule.filter(s => {
              const todayShift = s.shifts.find(
                shift => shift.date === new Date().toISOString().split('T')[0]
              );
              return todayShift && todayShift.assignment !== 'Off' && todayShift.assignment !== 'Unassigned';
            }).length}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500">Off Today</div>
          <div className="text-2xl font-bold text-gray-600">
            {displaySchedule.filter(s => {
              const todayShift = s.shifts.find(
                shift => shift.date === new Date().toISOString().split('T')[0]
              );
              return todayShift && todayShift.assignment === 'Off';
            }).length}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500">Unassigned</div>
          <div className="text-2xl font-bold text-amber-600">
            {displaySchedule.filter(s => {
              const todayShift = s.shifts.find(
                shift => shift.date === new Date().toISOString().split('T')[0]
              );
              return !todayShift || todayShift.assignment === 'Unassigned';
            }).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSchedule;