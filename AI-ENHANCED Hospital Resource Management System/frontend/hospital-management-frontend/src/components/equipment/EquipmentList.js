import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../common/DataTable';
import { getAllEquipment, getEquipmentStats } from '../../services/equipmentService';
import { toast } from 'react-toastify';

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipment();
    fetchStatistics();
  }, [filters, pagination.page, pagination.limit]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await getAllEquipment(params);
      setEquipment(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError('Failed to load equipment data. Please try again.');
      setLoading(false);
      toast.error('Error loading equipment data');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getEquipmentStats();
      setStatistics(response.data.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      // Non-critical, so just log error without showing to user
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRowClick = (equipment) => {
    navigate(`/equipment/${equipment._id}`);
  };

  const handleCreateEquipment = () => {
    navigate('/equipment/create');
  };
  
  const handleMaintenanceSchedule = () => {
    navigate('/equipment/maintenance');
  };
  
  const handleUploadExcel = () => {
    navigate('/equipment/upload');
  };

  const columns = [
    { field: 'equipmentId', label: 'Equipment ID', sortable: true },
    { field: 'name', label: 'Name', sortable: true },
    { field: 'category', label: 'Category', sortable: true },
    { 
      field: 'status', 
      label: 'Status', 
      sortable: true,
      render: (row) => {
        const statusColors = {
          'Available': 'green',
          'In Use': 'blue',
          'Maintenance': 'yellow',
          'Out of Order': 'red'
        };
        
        return (
          <span 
            className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusColors[row.status]}-100 text-${statusColors[row.status]}-800`}
          >
            {row.status}
          </span>
        );
      }
    },
    { 
      field: 'location', 
      label: 'Location', 
      render: (row) => `${row.location?.ward || ''}, Room ${row.location?.room || ''}` 
    },
    {
      field: 'condition',
      label: 'Condition',
      sortable: true,
      render: (row) => {
        const conditionColors = {
          'Excellent': 'green',
          'Good': 'blue',
          'Fair': 'yellow',
          'Poor': 'red'
        };
        
        return (
          <span className={`text-${conditionColors[row.condition]}-600`}>
            {row.condition}
          </span>
        );
      }
    },
    {
      field: 'nextMaintenance',
      label: 'Next Maintenance',
      sortable: true,
      render: (row) => row.nextMaintenance ? new Date(row.nextMaintenance).toLocaleDateString() : 'Not scheduled'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Equipment Management</h1>
        <div className="flex space-x-2">
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            onClick={handleUploadExcel}
          >
            Upload Excel
          </button>
          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
            onClick={handleMaintenanceSchedule}
          >
            Maintenance Schedule
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={handleCreateEquipment}
          >
            Add New Equipment
          </button>
        </div>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Equipment</h3>
            <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Available</h3>
            <div className="text-2xl font-bold text-green-600">{statistics.available}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">In Use</h3>
            <div className="text-2xl font-bold text-blue-600">{statistics.inUse}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Maintenance</h3>
            <div className="text-2xl font-bold text-yellow-600">{statistics.maintenance}</div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Critical">Critical</option>
              <option value="Imaging">Imaging</option>
              <option value="Monitoring">Monitoring</option>
              <option value="Surgical">Surgical</option>
              <option value="Laboratory">Laboratory</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Order">Out of Order</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search equipment ID, name..."
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
        data={equipment}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        loading={loading}
        emptyMessage="No equipment found matching the criteria"
      />
    </div>
  );
};

export default EquipmentList;