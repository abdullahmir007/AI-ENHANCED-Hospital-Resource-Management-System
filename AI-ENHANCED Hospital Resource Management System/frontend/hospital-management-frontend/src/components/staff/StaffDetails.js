import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStaffById, getStaffSchedule, getStaffPerformance } from '../../services/staffService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StaffDetails = () => {
  const [staff, setStaff] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        
        // Fetch staff details
        const staffResponse = await getStaffById(id);
        setStaff(staffResponse.data.data);
        
        // Fetch schedule data
        const scheduleResponse = await getStaffSchedule(id, { limit: 14 });
        setSchedule(scheduleResponse.data.data);
        
        // Fetch performance data
        const performanceResponse = await getStaffPerformance(id, { period: '30days' });
        setPerformance(performanceResponse.data.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch staff details');
        setLoading(false);
        console.error('Error fetching staff details:', err);
      }
    };

    fetchStaffData();
  }, [id]);

  const handleEdit = () => {
    navigate(`/staff/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/staff');
  };
  
  const handleSchedule = () => {
    navigate(`/staff/${id}/schedule`);
  };

  // Mock data for initial development
  const mockStaff = {
    _id: id,
    staffId: 'S001',
    name: 'Dr. John Smith',
    staffType: 'Surgeon',
    specialty: 'Cardiothoracic',
    licensedSince: '2010-05-15',
    onDuty: true,
    currentAssignment: 'ER',
    department: 'Surgery',
    supervisor: 'Dr. Jane Wilson',
    patientsAssigned: 9,
    contactInfo: {
      email: 'john.smith@hospital.com',
      phone: '555-1234',
      address: '123 Medical Drive, Healthcare City'
    },
    emergencyContact: {
      name: 'Mary Smith',
      relationship: 'Spouse',
      phone: '555-9876'
    },
    certifications: [
      { name: 'Advanced Cardiac Life Support', issuedDate: '2020-03-10', expirationDate: '2023-03-10' },
      { name: 'Basic Life Support', issuedDate: '2021-05-15', expirationDate: '2024-05-15' }
    ],
    education: [
      { degree: 'MD', institution: 'Harvard Medical School', year: '2005' },
      { degree: 'Residency', institution: 'Johns Hopkins Hospital', year: '2010' },
      { degree: 'Fellowship', institution: 'Mayo Clinic', year: '2012' }
    ],
    performanceMetrics: {
      patientSatisfaction: 92,
      patientsTreated: 145,
      averagePatientLoad: 8.5,
      overtimeHours: 24,
      avgHoursPerShift: 9.2
    }
  };
  
  // Mock schedule data
  const mockSchedule = [
    { date: '2025-04-01', startTime: '08:00 AM', endTime: '05:00 PM', assignment: 'ER', hoursWorked: 9, status: 'Completed' },
    { date: '2025-04-02', startTime: '08:00 AM', endTime: '05:00 PM', assignment: 'ER', hoursWorked: 9, status: 'Completed' },
    { date: '2025-04-03', startTime: '08:00 AM', endTime: '07:00 PM', assignment: 'ER', hoursWorked: 11, status: 'Completed' },
    { date: '2025-04-04', startTime: 'Off', endTime: 'Off', assignment: 'N/A', hoursWorked: 0, status: 'Off' },
    { date: '2025-04-05', startTime: 'Off', endTime: 'Off', assignment: 'N/A', hoursWorked: 0, status: 'Off' },
    { date: '2025-04-06', startTime: '08:00 AM', endTime: '05:00 PM', assignment: 'ICU', hoursWorked: 9, status: 'Completed' },
    { date: '2025-04-07', startTime: '08:00 AM', endTime: '05:00 PM', assignment: 'ICU', hoursWorked: 9, status: 'Completed' },
    { date: '2025-04-08', startTime: '08:00 AM', endTime: '05:00 PM', assignment: 'ER', hoursWorked: 9, status: 'Scheduled' },
    { date: '2025-04-09', startTime: '08:00 AM', endTime: '05:00 PM', assignment: 'ER', hoursWorked: 9, status: 'Scheduled' },
    { date: '2025-04-10', startTime: '08:00 AM', endTime: '05:00 PM', assignment: 'ER', hoursWorked: 9, status: 'Scheduled' },
    { date: '2025-04-11', startTime: 'Off', endTime: 'Off', assignment: 'N/A', hoursWorked: 0, status: 'Off' },
    { date: '2025-04-12', startTime: 'Off', endTime: 'Off', assignment: 'N/A', hoursWorked: 0, status: 'Off' },
    { date: '2025-04-13', startTime: '08:00 AM', endTime: '05:00 PM', assignment: 'Surgery', hoursWorked: 9, status: 'Scheduled' },
    { date: '2025-04-14', startTime: '08:00 AM', endTime: '05:00 PM', assignment: 'Surgery', hoursWorked: 9, status: 'Scheduled' }
  ];
  
  // Mock performance data
  const mockPerformance = {
    workloadTrend: [
      { date: '2025-03-15', patients: 8, hours: 9, overtime: 0 },
      { date: '2025-03-16', patients: 7, hours: 9, overtime: 0 },
      { date: '2025-03-17', patients: 9, hours: 10, overtime: 1 },
      { date: '2025-03-18', patients: 10, hours: 11, overtime: 2 },
      { date: '2025-03-19', patients: 8, hours: 9, overtime: 0 },
      { date: '2025-03-20', patients: 9, hours: 10, overtime: 1 },
      { date: '2025-03-21', patients: 7, hours: 9, overtime: 0 },
      { date: '2025-03-22', patients: 0, hours: 0, overtime: 0 },
      { date: '2025-03-23', patients: 0, hours: 0, overtime: 0 },
      { date: '2025-03-24', patients: 8, hours: 9, overtime: 0 },
      { date: '2025-03-25', patients: 7, hours: 9, overtime: 0 },
      { date: '2025-03-26', patients: 9, hours: 10, overtime: 1 },
      { date: '2025-03-27', patients: 10, hours: 11, overtime: 2 },
      { date: '2025-03-28', patients: 8, hours: 9, overtime: 0 },
      { date: '2025-03-29', patients: 0, hours: 0, overtime: 0 },
      { date: '2025-03-30', patients: 0, hours: 0, overtime: 0 },
      { date: '2025-03-31', patients: 7, hours: 9, overtime: 0 },
      { date: '2025-04-01', patients: 8, hours: 9, overtime: 0 },
      { date: '2025-04-02', patients: 9, hours: 9, overtime: 0 },
      { date: '2025-04-03', patients: 11, hours: 11, overtime: 2 },
      { date: '2025-04-04', patients: 0, hours: 0, overtime: 0 },
      { date: '2025-04-05', patients: 0, hours: 0, overtime: 0 },
      { date: '2025-04-06', patients: 8, hours: 9, overtime: 0 },
      { date: '2025-04-07', patients: 9, hours: 9, overtime: 0 },
    ],
    metrics: {
      averagePatients: 8.5,
      averageHours: 9.5,
      totalOvertime: 9,
      efficiencyScore: 87,
      patientSatisfaction: 92
    },
    assignments: [
      { area: 'ER', days: 14 },
      { area: 'ICU', days: 5 },
      { area: 'Surgery', days: 8 },
      { area: 'General Ward', days: 3 }
    ]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || (!staff && !mockStaff)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Staff member not found'}
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleBack}
        >
          Back to Staff List
        </button>
      </div>
    );
  }

  // Use mock data if API data is not available
  const staffData = staff || mockStaff;
  const scheduleData = schedule.length > 0 ? schedule : mockSchedule;
  const performanceData = performance || mockPerformance;

  const getStatusBadge = (onDuty) => {
    return onDuty ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <span className="h-2 w-2 mr-1 bg-green-400 rounded-full"></span>
        On Duty
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        <span className="h-2 w-2 mr-1 bg-gray-400 rounded-full"></span>
        Off Duty
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Details</h1>
        <div className="space-x-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={handleSchedule}
          >
            View Schedule
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            onClick={handleEdit}
          >
            Edit Profile
          </button>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            onClick={handleBack}
          >
            Back
          </button>
        </div>
      </div>
      
      {/* Staff Overview */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('schedule')}
            >
              Schedule
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('performance')}
            >
              Performance
            </button>
          </nav>
        </div>
        
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="col-span-1">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
                    {staffData.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold">{staffData.name}</h2>
                    <div className="flex items-center text-gray-500">
                      <span className="mr-2">{staffData.staffId}</span>
                      {getStatusBadge(staffData.onDuty)}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium">{staffData.staffType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Specialty</p>
                      <p className="font-medium">{staffData.specialty}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{staffData.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Licensed Since</p>
                      <p className="font-medium">{new Date(staffData.licensedSince).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Supervisor</p>
                      <p className="font-medium">{staffData.supervisor}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{staffData.contactInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{staffData.contactInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{staffData.contactInfo.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-3">Emergency Contact</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{staffData.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Relationship</p>
                      <p className="font-medium">{staffData.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{staffData.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Middle Column */}
              <div className="col-span-1">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Current Assignment</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{staffData.currentAssignment}</span>
                      <span className="text-blue-600 font-medium">{staffData.patientsAssigned} Patients</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Currently assigned to {staffData.currentAssignment} department with a patient load of {staffData.patientsAssigned} patients.
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Certifications</h3>
                  <div className="space-y-3">
                    {staffData.certifications.map((cert, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="font-medium">{cert.name}</div>
                        <div className="text-sm text-gray-600">
                          <span>Issued: {new Date(cert.issuedDate).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>Expires: {new Date(cert.expirationDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Education</h3>
                  <div className="space-y-3">
                    {staffData.education.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="font-medium">{edu.degree}</div>
                        <div className="text-sm text-gray-600">
                          <span>{edu.institution}</span>
                          <span className="mx-2">•</span>
                          <span>{edu.year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="col-span-1">
                <h3 className="text-lg font-medium mb-3">Performance Summary</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-500">Patient Satisfaction</div>
                    <div className="text-2xl font-bold text-green-600">{staffData.performanceMetrics.patientSatisfaction}%</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-sm text-gray-500">Patients Treated</div>
                    <div className="text-2xl font-bold text-blue-600">{staffData.performanceMetrics.patientsTreated}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="text-sm text-gray-500">Avg. Patient Load</div>
                    <div className="text-2xl font-bold text-purple-600">{staffData.performanceMetrics.averagePatientLoad}</div>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <div className="text-sm text-gray-500">Overtime Hours</div>
                    <div className="text-2xl font-bold text-amber-600">{staffData.performanceMetrics.overtimeHours}</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mb-3">Upcoming Schedule</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {scheduleData.slice(0, 5).map((shift, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {shift.startTime === 'Off' ? 'Off' : `${shift.startTime} - ${shift.endTime}`}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {shift.assignment}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'schedule' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Schedule for {staffData.name}</h2>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                onClick={() => navigate(`/staff/${id}/schedule/edit`)}
              >
                Edit Schedule
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scheduleData.map((shift, index) => (
                    <tr key={index} className={shift.status === 'Off' ? 'bg-gray-50' : ''}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {shift.startTime}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {shift.endTime}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {shift.assignment}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {shift.hoursWorked}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          shift.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          shift.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {shift.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Total Hours</div>
                <div className="text-2xl font-bold text-blue-600">
                  {scheduleData.reduce((sum, shift) => sum + shift.hoursWorked, 0)}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Working Days</div>
                <div className="text-2xl font-bold text-green-600">
                  {scheduleData.filter(shift => shift.status !== 'Off').length}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Off Days</div>
                <div className="text-2xl font-bold text-gray-600">
                  {scheduleData.filter(shift => shift.status === 'Off').length}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Avg Hours/Day</div>
                <div className="text-2xl font-bold text-purple-600">
                  {(scheduleData.reduce((sum, shift) => sum + shift.hoursWorked, 0) / 
                    scheduleData.filter(shift => shift.status !== 'Off').length).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'performance' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2">
                <h3 className="text-lg font-medium mb-4">Workload Trend</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm border h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData.workloadTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => {
                          return [value, name === 'patients' ? 'Patients' : 
                                       name === 'hours' ? 'Hours' : 'Overtime']
                        }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="patients" 
                        name="Patients" 
                        stroke="#3b82f6" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="hours" 
                        name="Hours Worked" 
                        stroke="#10b981" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="overtime" 
                        name="Overtime" 
                        stroke="#f59e0b" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <h3 className="text-lg font-medium mb-4 mt-6">Area Assignments (Last 30 Days)</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="space-y-4">
                    {performanceData.assignments.map((assignment, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{assignment.area}</span>
                          <span className="text-sm text-gray-500">{assignment.days} days</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${(assignment.days / 30) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="col-span-1">
                <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-sm text-gray-500 mb-1">Efficiency Score</div>
                    <div className="flex items-center">
                      <div className="text-3xl font-bold text-blue-600 mr-2">{performanceData.metrics.efficiencyScore}/100</div>
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Good
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-sm text-gray-500 mb-1">Patient Satisfaction</div>
                    <div className="flex items-center">
                      <div className="text-3xl font-bold text-green-600 mr-2">{performanceData.metrics.patientSatisfaction}%</div>
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Excellent
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-sm text-gray-500 mb-2">Average Patients Per Shift</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {performanceData.metrics.averagePatients}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-sm text-gray-500 mb-2">Average Hours Per Shift</div>
                    <div className="text-3xl font-bold text-indigo-600">
                      {performanceData.metrics.averageHours}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-sm text-gray-500 mb-2">Total Overtime (30 Days)</div>
                    <div className="text-3xl font-bold text-amber-600">
                      {performanceData.metrics.totalOvertime} hrs
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    onClick={() => navigate(`/staff/${id}/performance/full-report`)}
                  >
                    View Full Performance Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDetails;