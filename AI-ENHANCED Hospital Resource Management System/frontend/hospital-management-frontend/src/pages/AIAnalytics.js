import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HospitalAIDashboard from '../components/ai-analytics/HospitalAIDashboard';

const AIAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">AI Analytics & Insights</h1>
        <div className="space-x-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b overflow-x-auto">
          <button 
            className={`py-3 px-6 font-medium text-sm whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </button>
        </div>
      </div>

      {/* Main Dashboard Component */}
      <HospitalAIDashboard activeTab={activeTab} />
    </div>
  );
};

export default AIAnalytics;
