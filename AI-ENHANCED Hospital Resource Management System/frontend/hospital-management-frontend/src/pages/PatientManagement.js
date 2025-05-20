import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { getAllPatients, getPatientStats } from '../services/patientService';
import PatientList from '../components/patients/PatientList';
import PatientDetails from '../components/patients/PatientDetails';
import PatientForm from '../components/patients/PatientForm';
import PatientUpload from '../components/patients/PatientUpload';

const PatientManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inpatient: 0,
    outpatient: 0,
    averageStay: 0
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        
        // Fetch all patients
        const patientsResponse = await getAllPatients();
        setPatients(patientsResponse.data.data);
        
        // Fetch patient statistics
        try {
          const statsResponse = await getPatientStats();
          setStats({
            total: statsResponse.data.data.total || patientsResponse.data.data.length,
            inpatient: statsResponse.data.data.inpatient || patientsResponse.data.data.filter(p => p.status === 'Admitted').length,
            outpatient: statsResponse.data.data.outpatient || 0,
            averageStay: statsResponse.data.data.averageStay || calculateAverageStay(patientsResponse.data.data)
          });
        } catch (statsError) {
          console.warn('Failed to fetch stats, calculating from patient data:', statsError);
          
          // Calculate stats from patients data
          const patientData = patientsResponse.data.data;
          const admitted = patientData.filter(p => p.status === 'Admitted').length;
          
          setStats({
            total: patientData.length,
            inpatient: admitted,
            outpatient: patientData.filter(p => 
              p.status === 'Admitted' && !p.assignedBed
            ).length,
            averageStay: calculateAverageStay(patientData)
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient data. Please try again.');
        setLoading(false);
      }
    };

    fetchPatients();
  }, [location.pathname]); // Refetch when navigating back to list
  
  // Helper function to calculate average length of stay
  const calculateAverageStay = (patientData) => {
    const dischargedPatients = patientData.filter(p => 
      p.status === 'Discharged' && p.dischargeDate && p.admissionDate
    );
    
    if (dischargedPatients.length === 0) return 0;
    
    const totalDays = dischargedPatients.reduce((sum, patient) => {
      const admissionDate = new Date(patient.admissionDate);
      const dischargeDate = new Date(patient.dischargeDate);
      const daysDiff = Math.ceil((dischargeDate - admissionDate) / (1000 * 60 * 60 * 24));
      return sum + (daysDiff > 0 ? daysDiff : 0);
    }, 0);
    
    return Math.round((totalDays / dischargedPatients.length) * 10) / 10;
  };

  const handleAddPatient = () => {
    navigate('/patients/add');
  };

  const handleUploadPatients = () => {
    navigate('/patients/upload');
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patient Management</h1>
        <div className="flex space-x-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={handleAddPatient}
          >
            Add New Patient
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            onClick={handleUploadPatients}
          >
            Upload Patient Data
          </button>
        </div>
      </div>
      
      {/* Patient statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Patients</h3>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Inpatients</h3>
          <div className="text-2xl font-bold">{stats.inpatient}</div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Outpatients</h3>
          <div className="text-2xl font-bold">{stats.outpatient}</div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Avg Length of Stay</h3>
          <div className="text-2xl font-bold">{stats.averageStay} days</div>
        </div>
      </div>
      
      <Routes>
        <Route index element={<PatientList patients={patients} />} />
        <Route path="add" element={<PatientForm />} />
        <Route path="upload" element={<PatientUpload />} />
        <Route path=":id" element={<PatientDetails />} />
        <Route path=":id/edit" element={<PatientForm isEditing={true} />} />
      </Routes>
    </div>
  );
};

export default PatientManagement;