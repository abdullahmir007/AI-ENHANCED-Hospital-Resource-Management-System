import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../common/DataTable';
import { getScheduledMaintenance, addMaintenanceRecord } from '../../services/equipmentService';
import { toast } from 'react-toastify';

const MaintenanceSchedule = () => {
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    timeframe: '30',
    search: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMaintenanceData();
  }, [filters, pagination.page, pagination.limit]);

  const fetchMaintenanceData = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await getScheduledMaintenance(params);
      setMaintenanceData(response.data.data);
      
      // If pagination data is included in the response
      if (response.data.pagination) {
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        });
      } else {
        // If not, estimate pagination based on data length
        setPagination({
          ...pagination,
          total: response.data.data.length,
          pages: Math.ceil(response.data.data.length / pagination.limit)
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching maintenance data:', err);
      setError('Failed to load maintenance schedule. Please try again.');
      setLoading(false);
      toast.error('Error loading maintenance schedule');
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRowClick = (maintenance) => {
    navigate(`/equipment/${maintenance.equipmentId}`);
  };

  const handleScheduleMaintenance = () => {
    navigate('/equipment/maintenance/schedule/new');
  };

  const handleCompleteMaintenance = async (id) => {
    try {
      // Find the maintenance record
      const maintenance = maintenanceData.find(item => item._id === id);
      
      if (!maintenance) {
        toast.error('Maintenance record not found');
        return;
      }
      
      // Prepare maintenance record data
      const maintenanceData = {
        date: new Date(),
        type: maintenance.maintenanceType,
        technician: "Current User", // Replace with actual user name from auth context
        notes: `Completed scheduled maintenance: ${maintenance.notes}`,
        cost: 0 // This would need to be captured from a form in a real app
      };
      
      // Add maintenance record to the equipment
      await addMaintenanceRecord(maintenance.equipmentId, maintenanceData);
      
      toast.success('Maintenance marked as completed');
      fetchMaintenanceData(); // Refresh the data
    } catch (err) {
      console.error('Error completing maintenance:', err);
      toast.error('Failed to complete maintenance');
    }
  };

  const getPriorityColor = (priority) => {
    const priorityColors = {
      'Critical': 'red',
      'High': 'orange',
      'Medium': 'yellow',
      'Low': 'green'
    };
    return priorityColors[priority] || 'gray';
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Scheduled': 'blue',
      'In Progress': 'yellow',
      'Completed': 'green',
      'Canceled': 'gray'
    };
    return statusColors[status] || 'gray';
  };

  const columns = [
    { field: 'equipmentId', label: 'Equipment ID', sortable: true },
    { field: 'equipmentName', label: 'Equipment Name', sortable: true },
    { 
      field: 'scheduledDate', 
      label: 'Scheduled Date', 
      sortable: true,
      render: (row) => new Date(row.scheduledDate).toLocaleDateString()
    },
    { 
      field: 'maintenanceType', 
      label: 'Type', 
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.maintenanceType === 'Preventive' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          {row.maintenanceType}
        </span>
      )
    },
    { 
      field: 'priority', 
      label: 'Priority', 
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getPriorityColor(row.priority)}-100 text-${getPriorityColor(row.priority)}-800`}>
          {row.priority}
        </span>
      )
    },
    { 
      field: 'status', 
      label: 'Status', 
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(row.status)}-100 text-${getStatusColor(row.status)}-800`}>
          {row.status}
        </span>
      )
    },
    { field: 'assignedTo', label: 'Assigned To', sortable: true },
    {
      field: 'estimatedDuration',
      label: 'Est. Duration',
      render: (row) => `${row.estimatedDuration} min`
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCompleteMaintenance(row._id);
            }}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            disabled={row.status === 'Completed'}
          >
            Complete
          </button>
        </div>
      )
    }
  ];

  // Helper function to count maintenance records by various criteria
  const countMaintenanceRecords = (criteriaFn) => {
    return maintenanceData.filter(criteriaFn).length;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Maintenance Schedule</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={handleScheduleMaintenance}
        >
          Schedule New Maintenance
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
            <select
              name="timeframe"
              value={filters.timeframe}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Next 7 days</option>
              <option value="14">Next 14 days</option>
              <option value="30">Next 30 days</option>
              <option value="90">Next 90 days</option>
              <option value="365">Next year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search equipment, technician..."
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

      <DataTable
        columns={columns}
        data={maintenanceData}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        loading={loading}
        emptyMessage="No maintenance records found matching the criteria"
      />
      
      {/* Quick Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Upcoming (7 days)</h3>
          <div className="text-2xl font-bold text-blue-600">
            {countMaintenanceRecords(item => 
              item.status === 'Scheduled' && 
              new Date(item.scheduledDate) <= new Date(new Date().setDate(new Date().getDate() + 7))
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">In Progress</h3>
          <div className="text-2xl font-bold text-yellow-600">
            {countMaintenanceRecords(item => item.status === 'In Progress')}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Completed (30 days)</h3>
          <div className="text-2xl font-bold text-green-600">
            {countMaintenanceRecords(item => 
              item.status === 'Completed' && 
              new Date(item.completionDate || item.scheduledDate) >= new Date(new Date().setDate(new Date().getDate() - 30))
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">High Priority Pending</h3>
          <div className="text-2xl font-bold text-red-600">
            {countMaintenanceRecords(item => 
              (item.status === 'Scheduled' || item.status === 'In Progress') && 
              (item.priority === 'Critical' || item.priority === 'High')
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSchedule;