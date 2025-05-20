import React, { useState, useEffect } from 'react';
import BedCapacityCard from '../components/dashboard/BedCapacityCard';
import EquipmentStatusCard from '../components/dashboard/EquipmentStatusCard';
import StaffAllocationCard from '../components/dashboard/StaffAllocationCard';
import PatientStatisticsCard from '../components/dashboard/PatientStatisticsCard';
import AIInsightsCard from '../components/dashboard/AIInsightsCard';
import { getDashboardStats } from '../services/dashboardService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        setDashboardData(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up refresh interval for real-time dashboard updates (every 60 seconds)
    const interval = setInterval(fetchDashboardData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Resource Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Bed Capacity Card with real data */}
        <BedCapacityCard />
        
        {/* AI Insights Card */}
        <AIInsightsCard />
        
        {/* Staff Allocation Card with real-time data */}
        <StaffAllocationCard />
        
        {/* Equipment Status Card with real data */}
        <EquipmentStatusCard />
        
        {/* Patient Statistics Card */}
        <PatientStatisticsCard />
      </div>
    </div>
  );
};

export default Dashboard;