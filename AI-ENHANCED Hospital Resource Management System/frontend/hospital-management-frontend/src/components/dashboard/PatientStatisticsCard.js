import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PatientStatisticsCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientStats, setPatientStats] = useState({
    total: 0,
    inpatient: 0,
    outpatient: 0,
    icu: 0,
    emergency: 0,
    waitingAdmission: 0,
    dischargeToday: 0
  });
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Simulate loading patient data
    const timer = setTimeout(() => {
      // Mock data for development without backend
      setPatientStats({
        total: 247,
        inpatient: 185,
        outpatient: 62,
        icu: 28,
        emergency: 43,
        waitingAdmission: 12,
        dischargeToday: 15
      });
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleManagePatientsClick = () => {
    navigate('/patients');
  };
  
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md min-h-[300px] flex items-center justify-center">
        <div className="text-gray-500">Loading patient statistics...</div>
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
  
  // Chart data for patient distribution
  const chartData = [
    { name: 'Regular', value: patientStats.inpatient - patientStats.icu - patientStats.emergency },
    { name: 'ICU', value: patientStats.icu },
    { name: 'Emergency', value: patientStats.emergency },
    { name: 'Outpatient', value: patientStats.outpatient }
  ];
  
  const COLORS = ['#3b82f6', '#ef4444', '#f97316', '#10b981'];
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-blue-800">Patient Statistics</h3>
        <span className="text-gray-400 cursor-pointer">⋮</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-2xl font-bold text-blue-700">{patientStats.total}</div>
          <div className="text-xs text-blue-600">Total Patients</div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-2xl font-bold text-green-700">{patientStats.waitingAdmission}</div>
          <div className="text-xs text-green-600">Waiting Admission</div>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <div className="text-2xl font-bold text-purple-700">{patientStats.dischargeToday}</div>
          <div className="text-xs text-purple-600">Discharge Today</div>
        </div>
      </div>
      
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={50}
              labelLine={false}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="text-sm space-y-1 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Inpatient</span>
          <span className="font-medium">{patientStats.inpatient}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Outpatient</span>
          <span className="font-medium">{patientStats.outpatient}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">ICU Occupancy</span>
          <span className="font-medium">{Math.round((patientStats.icu / patientStats.inpatient) * 100)}%</span>
        </div>
      </div>
      
      <button 
        className="bg-blue-800 text-white py-2 px-4 rounded w-full mt-2 hover:bg-blue-900"
        onClick={handleManagePatientsClick}
      >
        Manage Patients
      </button>
    </div>
  );
};

export default PatientStatisticsCard;