// src/components/staff/StaffList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStaff } from '../../services/StaffService';
import DataTable from '../common/DataTable';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    staffType: '',
    currentAssignment: '', // Changed from 'assignment' to match API field
    onDuty: '',
    search: ''
  });

  const navigate = useNavigate();

  const fetchStaff = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Create clean params object with only non-empty values
      const params = {
        page,
        limit: pagination.limit
      };
      
      // Only add filters that have values
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      console.log("Fetching staff with params:", params);
      const response = await getAllStaff(params);
      console.log("Full API Response:", response);
      console.log("Response data structure:", JSON.stringify(response.data, null, 2));

      if (response && response.data && response.data.success === true) {
        const staffData = response.data.data || [];
        const paginationData = response.data.pagination || pagination;

        console.log("Extracted staff data:", staffData);
        console.log("Extracted pagination:", paginationData);

        setStaff(staffData);
        setPagination(paginationData);
      } else {
        console.error("Unexpected response format:", response);
        setError('Unexpected data format received from server');
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError('Failed to fetch staff data: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  // Reset filters and fetch on initial mount
  useEffect(() => {
    // Clear all filters on first load
    setFilters({
      staffType: '',
      currentAssignment: '',
      onDuty: '',
      search: ''
    });
    fetchStaff(1);
  }, []);

  // Fetch when filters change
  useEffect(() => {
    fetchStaff(1);
  }, [filters]);

  const handlePageChange = (page) => {
    fetchStaff(page);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    // Convert 'assignment' to 'currentAssignment' for API compatibility
    const apiParamName = name === 'assignment' ? 'currentAssignment' : name;
    setFilters(prev => ({ ...prev, [apiParamName]: value }));
  };

  const handleRowClick = (staffMember) => {
    navigate(`/staff/${staffMember._id}`);
  };

  const handleCreateStaff = () => {
    navigate('/staff/create');
  };

  const handleScheduleView = () => {
    navigate('/staff/schedule');
  };

  const handleOptimizeStaffing = () => {
    navigate('/staff/optimize');
  };

  const getStatusIndicator = (onDuty) => {
    return onDuty ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <span className="h-2 w-2 mr-1 bg-green-400 rounded-full"></span>
        On Duty
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <span className="h-2 w-2 mr-1 bg-gray-400 rounded-full"></span>
        Off Duty
      </span>
    );
  };

  const columns = [
    { field: 'staffId', label: 'Staff ID', sortable: true },
    { field: 'name', label: 'Name', sortable: true },
    { field: 'staffType', label: 'Role', sortable: true },
    {
      field: 'onDuty',
      label: 'Status',
      sortable: true,
      render: (row) => getStatusIndicator(row.onDuty)
    },
    { field: 'currentAssignment', label: 'Assignment', sortable: true },
    {
      field: 'patientsAssigned',
      label: 'Patients',
      render: (row) => row.patientsAssigned || '0'
    },
    {
      field: 'contactInfo',
      label: 'Contact',
      render: (row) => {
        if (row.contactInfo && row.contactInfo.phone) {
          return row.contactInfo.phone;
        } else if (typeof row.contactInfo === 'string') {
          return row.contactInfo;
        } else if (row.contactInfo) {
          const contactValues = Object.values(row.contactInfo);
          for (const val of contactValues) {
            if (typeof val === 'string' && val.includes('-')) {
              return val;
            }
          }
        }
        return 'N/A';
      }
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/staff/${row._id}/schedule`);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            Schedule
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/staff/${row._id}/edit`);
            }}
            className="text-green-600 hover:text-green-800"
          >
            Edit
          </button>
        </div>
      )
    }
  ];

  // Mock data as fallback
  const mockStaff = [
    {
      _id: '1',
      staffId: 'S001',
      name: 'Dr. John Smith',
      staffType: 'Surgeon',
      onDuty: true,
      currentAssignment: 'ER',
      patientsAssigned: 9,
      contactInfo: { phone: '555-1234' }
    },
    {
      _id: '2',
      staffId: 'S002',
      name: 'Sarah Johnson',
      staffType: 'Nurse',
      onDuty: true,
      currentAssignment: 'General Ward',
      patientsAssigned: 12,
      contactInfo: { phone: '555-2345' }
    },
    {
      _id: '3',
      staffId: 'S003',
      name: 'Michael Rodriguez',
      staffType: 'Technician',
      onDuty: false,
      currentAssignment: 'Radiology',
      patientsAssigned: 0,
      contactInfo: { phone: '555-3456' }
    }
  ];
  
  const displayData = staff.length > 0 ? staff : mockStaff;
  const isUsingMockData = staff.length === 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        <div className="space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" onClick={handleScheduleView}>View Schedule</button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700" onClick={handleOptimizeStaffing}>Optimize Staffing</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700" onClick={handleCreateStaff}>Add Staff</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
            <select 
              name="staffType" 
              value={filters.staffType} 
              onChange={handleFilterChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Surgeon">Surgeon</option>
              <option value="Nurse">Nurse</option>
              <option value="Technician">Technician</option>
              <option value="Physician">Physician</option>
              <option value="Administrator">Administrative</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
            <select 
              name="assignment" 
              value={filters.currentAssignment} 
              onChange={handleFilterChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Assignments</option>
              <option value="ER">Emergency Room</option>
              <option value="General Ward">General Ward</option>
              <option value="ICU">Intensive Care</option>
              <option value="Surgery">Surgery</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Radiology">Radiology</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              name="onDuty" 
              value={filters.onDuty} 
              onChange={handleFilterChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="true">On Duty</option>
              <option value="false">Off Duty</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input 
              type="text" 
              name="search" 
              value={filters.search} 
              onChange={handleFilterChange} 
              placeholder="Search by name, ID..." 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={displayData}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        loading={loading}
        emptyMessage="No staff found matching the criteria"
      />
    </div>
  );
};

export default StaffList;