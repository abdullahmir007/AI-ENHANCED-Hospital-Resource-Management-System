import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardAIInsights } from '../../services/dashboardService';

const AIInsightsCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await getDashboardAIInsights();
        setInsights(response.data.data.slice(0, 3)); // Show top 3 insights
        setLoading(false);
      } catch (err) {
        setError('Could not load AI insights');
        setLoading(false);
        console.error('Error fetching AI insights:', err);
      }
    };
    
    fetchInsights();
  }, []);
  
  const handleViewAll = () => {
    navigate('/ai-analytics');
  };
  
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md min-h-[300px] flex items-center justify-center">
        <div className="text-gray-500">Loading AI insights...</div>
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
  const mockInsights = [
    {
      id: 'i1',
      title: 'Bed Allocation Optimization',
      description: 'Expected peak in ER admissions in 48 hours based on seasonal patterns. Consider reallocating 4 beds from surgical to ER ward.',
      type: 'suggestion',
      priority: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: 'i2',
      title: 'Staff Scheduling Efficiency',
      description: 'Night shift in pediatric ward consistently overstaffed by 15%. Consider adjusting schedule to better balance workload.',
      type: 'efficiency',
      priority: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
    },
    {
      id: 'i3',
      title: 'Potential Influenza Outbreak',
      description: 'Detected 27% increase in influenza-like symptoms. Early indicators of potential seasonal outbreak.',
      type: 'alert',
      priority: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
    }
  ];
  
  // Use mock data if backend data is not available
  const displayInsights = insights.length > 0 ? insights : mockInsights;
  
  const getInsightIcon = (type) => {
    switch (type) {
      case 'suggestion': return '💡';
      case 'efficiency': return '⚙️';
      case 'alert': return '⚠️';
      default: return '🤖';
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'blue';
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
        <h3 className="font-bold text-lg text-blue-800">AI Insights</h3>
        <span className="text-gray-400 cursor-pointer">⋮</span>
      </div>
      
      <div className="space-y-3">
        {displayInsights.map((insight) => (
          <div 
            key={insight.id} 
            className={`p-3 border-l-3 border-${getPriorityColor(insight.priority)}-500 bg-${getPriorityColor(insight.priority)}-50 rounded cursor-pointer hover:bg-${getPriorityColor(insight.priority)}-100`}
            onClick={() => navigate('/ai-analytics')}
          >
            <div className="flex items-start">
              <span className="text-xl mr-2">{getInsightIcon(insight.type)}</span>
              <div>
                <h4 className="font-medium text-gray-800">{insight.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {formatTimestamp(insight.timestamp)}
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
        View All Insights
      </button>
    </div>
  );
};

export default AIInsightsCard;