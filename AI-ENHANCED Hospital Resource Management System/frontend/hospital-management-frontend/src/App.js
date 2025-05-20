import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/common/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import BedManagement from './pages/BedManagement';
import StaffAllocation from './pages/StaffAllocation';
import EquipmentManagement from './pages/EquipmentManagement';
import PatientManagement from './pages/PatientManagement';
import AIAnalytics from './pages/AIAnalytics';
import ReportRoutes from './routes/ReportRoutes';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          <ToastContainer position="top-right" autoClose={5000} />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="beds/*" element={<BedManagement />} />
              <Route path="staff/*" element={<StaffAllocation />} />
              <Route path="equipment/*" element={<EquipmentManagement />} />
              <Route path="patients/*" element={<PatientManagement />} />
              <Route path="ai-analytics/*" element={<AIAnalytics />} />
              <Route path="reports/*" element={<ReportRoutes />} />
              <Route path="alerts/*" element={<Alerts />} />
              <Route path="settings/*" element={<Settings />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;