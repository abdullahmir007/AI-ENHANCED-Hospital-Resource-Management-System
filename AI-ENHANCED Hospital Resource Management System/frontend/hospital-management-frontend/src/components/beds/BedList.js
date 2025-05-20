import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../common/DataTable';
import BedUpload from './BedUpload'; // Import the new BedUpload component
import { getAllBeds } from '../../services/bedService';

const BedList = () => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    ward: '',
    status: '',
    search: ''
  });
  const [showUpload, setShowUpload] = useState(false);
  
  const navigate = useNavigate();

  const fetchBeds = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        ...filters
      };

      const response = await getAllBeds(params);
      
      if (response && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          setBeds(response.data.data);
        } else {
          setBeds([]);
        }
        
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        setBeds([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch beds. Please try again later.');
      setBeds([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeds();
  }, [filters]);

  const handlePageChange = (page) => {
    fetchBeds(page);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRowClick = (bed) => {
    navigate(`/beds/${bed._id}`);
  };

  const handleCreateBed = () => {
    navigate('/beds/create');
  };

  const toggleUploadForm = () => {
    setShowUpload(!showUpload);
  };

  const refreshList = () => {
    fetchBeds(pagination.page);
  };

  const columns = [
    { field: 'bedId', label: 'Bed ID', sortable: true },
    { field: 'ward', label: 'Ward', sortable: true },
    { 
      field: 'status', 
      label: 'Status', 
      sortable: true,
      render: (row) => {
        const statusColors = {
          'Available': 'green',
          'Occupied': 'red',
          'Reserved': 'yellow',
          'Maintenance': 'gray'
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
      render: (row) => `${row.location?.building || ''}, Floor ${row.location?.floor || ''}, Room ${row.location?.roomNumber || ''}` 
    },
    {
      field: 'currentPatient',
      label: 'Patient',
      render: (row) => row.currentPatient ? row.currentPatient.name : 'None'
    },
    {
      field: 'lastSanitized',
      label: 'Last Sanitized',
      sortable: true,
      render: (row) => new Date(row.lastSanitized).toLocaleDateString()
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bed Management</h1>
        <div className="space-x-2">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            onClick={toggleUploadForm}
          >
            {showUpload ? 'Hide Upload Form' : 'Upload Bed Data'}
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={handleCreateBed}
          >
            Add New Bed
          </button>
        </div>
      </div>

      {showUpload && (
        <BedUpload onUploadComplete={refreshList} />
      )}

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
            <select
              name="ward"
              value={filters.ward}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Wards</option>
              <option value="ICU">ICU</option>
              <option value="ER">ER</option>
              <option value="General">General Ward</option>
              <option value="Pediatric">Pediatric</option>
              <option value="Maternity">Maternity</option>
              <option value="Surgical">Surgical</option>
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
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search bed ID, room..."
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
        data={beds}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        loading={loading}
        emptyMessage="No beds found matching the criteria"
      />
    </div>
  );
};

export default BedList;