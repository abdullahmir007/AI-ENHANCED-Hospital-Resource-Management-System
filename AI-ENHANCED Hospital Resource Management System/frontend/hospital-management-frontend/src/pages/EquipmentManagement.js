import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EquipmentList from '../components/equipment/EquipmentList';
import EquipmentDetails from '../components/equipment/EquipmentDetails';
import EquipmentForm from '../components/equipment/EquipmentForm';
import MaintenanceSchedule from '../components/equipment/MaintenanceSchedule';
import EquipmentUpload from '../components/equipment/EquipmentUpload';

const EquipmentManagement = () => {
  return (
    <Routes>
      <Route index element={<EquipmentList />} />
      <Route path="create" element={<EquipmentForm />} />
      <Route path=":id" element={<EquipmentDetails />} />
      <Route path=":id/edit" element={<EquipmentForm />} />
      <Route path="maintenance" element={<MaintenanceSchedule />} />
      <Route path="upload" element={<EquipmentUpload />} />
    </Routes>
  );
};

export default EquipmentManagement;