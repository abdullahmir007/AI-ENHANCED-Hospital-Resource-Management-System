import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardAlerts } from '../../services/dashboardService';

const AlertsCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await getDashboardAlerts();
        setAlerts(response.data.data.slice(0, 3)); // Show top 3 alerts
        setLoading(false);
      } catch (err) {
        setError('Could not load alerts');
        setLoading(false);
        console.error('Error fetching alerts:', err);
      }
    };
    
    fetchAlerts();
  }, []);
  
  const handleViewAll = () => {
    navigate('/alerts');
  };
  
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md min-h-[300px] flex items-center justify-center">
        <div className="text-gray-500">Loading alerts...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md">
        <div className="text-red-500">{error}</div>
        <button 
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Mock data for development without backend
  const mockAlerts = [
    {
      id: 'a1',
      title: 'ICU Bed Shortage',
      description: 'ICU beds at 95% capacity. Consider emergency protocols.',
      type: 'critical',
      timestamp: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
    },
    {
      id: 'a2',
      title: 'Ventilator Maintenance Needed',
      description: '3 ventilators due for maintenance within 24 hours.',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
    },
    {
      id: 'a3',
      title: 'Medication Stock Alert',
      description: 'Epinephrine supply low. Current stock will last 3 days at current rate.',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
    }
  ];
  
  // Use mock data if backend data is not available
  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts;
  
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return '🔴';
      case 'warning': return '🟠';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };
  
  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'red';
      case 'warning': return 'yellow';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hrs ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-blue-800">Recent Alerts</h3>
        <div className="flex items-center">
          <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
            {displayAlerts.length}
          </span>
          <span className="text-gray-400 cursor-pointer">⋮</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {displayAlerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-3 border-l-3 border-${getAlertColor(alert.type)}-500 bg-${getAlertColor(alert.type)}-50 rounded cursor-pointer hover:bg-${getAlertColor(alert.type)}-100`}
            onClick={() => navigate('/alerts')}
          >
            <div className="flex items-start">
              <span className="text-xl mr-2">{getAlertIcon(alert.type)}</span>
              <div>
                <h4 className="font-medium text-gray-800">{alert.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {formatTimestamp(alert.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="bg-blue-800 text-white py-2 px-4 rounded w-full mt-4 hover:bg-blue-900"
        onClick={handleViewAll}
      >
        View All Alerts
      </button>
    </div>
  );
};

export default AlertsCard;