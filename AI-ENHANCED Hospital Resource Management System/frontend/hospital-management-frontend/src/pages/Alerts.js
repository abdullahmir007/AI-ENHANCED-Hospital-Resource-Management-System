import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    priority: '',
    category: '',
    status: '',
    search: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching alerts data
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        
        // Mock data - in a real app, this would be an API call
        const mockAlerts = [
          {
            id: 'a1',
            title: 'ICU Bed Shortage',
            description: 'ICU beds at 95% capacity. Consider emergency protocols.',
            priority: 'critical',
            category: 'resources',
            status: 'active',
            timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
            assignedTo: null
          },
          {
            id: 'a2',
            title: 'Ventilator Maintenance Needed',
            description: '3 ventilators due for maintenance within 24 hours.',
            priority: 'high',
            category: 'equipment',
            status: 'active',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
            assignedTo: 'John Smith'
          },
          {
            id: 'a3',
            title: 'Medication Stock Alert',
            description: 'Epinephrine supply low. Current stock will last 3 days at current rate.',
            priority: 'high',
            category: 'supplies',
            status: 'active',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
            assignedTo: null
          },
          {
            id: 'a4',
            title: 'Staff Shortage in ER',
            description: 'ER operating with 70% staffing. Consider reallocation from other departments.',
            priority: 'critical',
            category: 'staffing',
            status: 'acknowledged',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
            assignedTo: 'Sarah Johnson',
            acknowledgedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString() // 2.5 hours ago
          },
          {
            id: 'a5',
            title: 'Security System Update Required',
            description: 'Critical security update needed for patient data system. Schedule maintenance window.',
            priority: 'medium',
            category: 'systems',
            status: 'active',
            timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
            assignedTo: 'Tech Support'
          },
          {
            id: 'a6',
            title: 'High Patient Wait Times',
            description: 'Average wait time in ER exceeding 35 minutes. Consider additional triage resources.',
            priority: 'medium',
            category: 'patient',
            status: 'resolved',
            timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
            resolvedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
            resolvedBy: 'Dr. Emily Chen'
          },
          {
            id: 'a7',
            title: 'Temperature Fluctuation in Lab Storage',
            description: 'Lab refrigeration unit showing temperature variance of 3.2°C. Maintenance required.',
            priority: 'high',
            category: 'equipment',
            status: 'resolved',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
            resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
            resolvedBy: 'Maintenance Team'
          },
          {
            id: 'a8',
            title: 'Patient Fall Incident',
            description: 'Patient fall reported in Room 302. Immediate assessment needed.',
            priority: 'critical',
            category: 'incident',
            status: 'acknowledged',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
            assignedTo: 'Rapid Response Team',
            acknowledgedAt: new Date(Date.now() - 1000 * 60 * 60 * 5.9).toISOString() // 5.9 hours ago
          }
        ];

        // Filter alerts based on tab selection
        let filteredAlerts = [...mockAlerts];
        
        if (activeTab !== 'all') {
          filteredAlerts = filteredAlerts.filter(alert => alert.status === activeTab);
        }
        
        // Apply additional filters
        if (filters.priority) {
          filteredAlerts = filteredAlerts.filter(alert => alert.priority === filters.priority);
        }
        
        if (filters.category) {
          filteredAlerts = filteredAlerts.filter(alert => alert.category === filters.category);
        }
        
        if (filters.status) {
          filteredAlerts = filteredAlerts.filter(alert => alert.status === filters.status);
        }
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredAlerts = filteredAlerts.filter(alert => 
            alert.title.toLowerCase().includes(searchTerm) || 
            alert.description.toLowerCase().includes(searchTerm)
          );
        }
        
        // Sort by priority and timestamp
        filteredAlerts.sort((a, b) => {
          // First sort by priority
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          
          // Then sort by timestamp (most recent first)
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        setAlerts(filteredAlerts);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch alerts');
        setLoading(false);
        console.error('Error fetching alerts:', err);
      }
    };

    fetchAlerts();
  }, [activeTab, filters]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAcknowledge = (alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'acknowledged', 
              acknowledgedAt: new Date().toISOString(),
              assignedTo: alert.assignedTo || 'Current User'
            } 
          : alert
      )
    );
  };

  const handleResolve = (alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'resolved', 
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'Current User'
            } 
          : alert
      )
    );
  };

  const handleAssign = (alertId, user = 'Current User') => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, assignedTo: user } 
          : alert
      )
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffMins < 1440) {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'red';
      case 'acknowledged': return 'yellow';
      case 'resolved': return 'green';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'resources': return '🛏️';
      case 'equipment': return '🔧';
      case 'supplies': return '📦';
      case 'staffing': return '👨‍⚕️';
      case 'systems': return '💻';
      case 'patient': return '🧑‍⚕️';
      case 'incident': return '⚠️';
      default: return '📝';
    }
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
        <h1 className="text-2xl font-bold text-gray-800">Alerts & Notifications</h1>
        <div className="space-x-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500">Total Alerts</div>
          <div className="text-2xl font-bold text-blue-600">{alerts.length}</div>
          <div className="text-xs text-gray-500 mt-1">Active and resolved</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500">Critical Alerts</div>
          <div className="text-2xl font-bold text-red-600">{alerts.filter(a => a.priority === 'critical').length}</div>
          <div className="text-xs text-gray-500 mt-1">Require immediate attention</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500">Unacknowledged</div>
          <div className="text-2xl font-bold text-orange-600">{alerts.filter(a => a.status === 'active').length}</div>
          <div className="text-xs text-gray-500 mt-1">Need response</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500">Resolved Today</div>
          <div className="text-2xl font-bold text-green-600">{alerts.filter(a => a.status === 'resolved').length}</div>
          <div className="text-xs text-gray-500 mt-1">In the past 24 hours</div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex space-x-4">
              <button
                className={`px-3 py-1 rounded-md ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleTabChange('all')}
              >
                All Alerts
              </button>
              <button
                className={`px-3 py-1 rounded-md ${activeTab === 'active' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleTabChange('active')}
              >
                Active
              </button>
              <button
                className={`px-3 py-1 rounded-md ${activeTab === 'acknowledged' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleTabChange('acknowledged')}
              >
                Acknowledged
              </button>
              <button
                className={`px-3 py-1 rounded-md ${activeTab === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleTabChange('resolved')}
              >
                Resolved
              </button>
            </div>
            
            <div className="flex space-x-2">
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="resources">Resources</option>
                <option value="equipment">Equipment</option>
                <option value="supplies">Supplies</option>
                <option value="staffing">Staffing</option>
                <option value="systems">Systems</option>
                <option value="patient">Patient</option>
                <option value="incident">Incident</option>
              </select>
              
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search alerts..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`bg-white p-5 rounded-lg shadow-md border-l-4 border-${getPriorityColor(alert.priority)}-500`}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{getCategoryIcon(alert.category)}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-lg">{alert.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getPriorityColor(alert.priority)}-100 text-${getPriorityColor(alert.priority)}-800`}>
                          {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(alert.status)}-100 text-${getStatusColor(alert.status)}-800`}>
                          {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{alert.description}</p>
                      <div className="mt-2 text-sm text-gray-500 flex items-center flex-wrap gap-x-4 gap-y-1">
                        <span>
                          <span className="font-medium">Reported:</span> {formatTimestamp(alert.timestamp)}
                        </span>
                        
                        {alert.assignedTo && (
                          <span>
                            <span className="font-medium">Assigned to:</span> {alert.assignedTo}
                          </span>
                        )}
                        
                        {alert.acknowledgedAt && (
                          <span>
                            <span className="font-medium">Acknowledged:</span> {formatTimestamp(alert.acknowledgedAt)}
                          </span>
                        )}
                        
                        {alert.resolvedAt && (
                          <span>
                            <span className="font-medium">Resolved:</span> {formatTimestamp(alert.resolvedAt)} by {alert.resolvedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 ml-auto">
                  {alert.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => handleAssign(alert.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Assign
                      </button>
                    </>
                  )}
                  
                  {(alert.status === 'active' || alert.status === 'acknowledged') && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Resolve
                    </button>
                  )}
                  
                  {alert.status === 'resolved' && (
                    <button
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">No alerts found</h3>
            <p className="text-gray-600">
              {activeTab === 'all' 
                ? "There are no alerts matching your filters." 
                : `There are no ${activeTab} alerts at this time.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;