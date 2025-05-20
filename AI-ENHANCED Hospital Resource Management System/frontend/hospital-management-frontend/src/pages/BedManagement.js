import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BedList from '../components/beds/BedList';
import BedDetails from '../components/beds/BedDetails';
import BedForm from '../components/beds/BedForm';

const BedManagement = () => {
  return (
    <Routes>
      <Route index element={<BedList />} />
      <Route path="create" element={<BedForm />} />
      <Route path=":id" element={<BedDetails />} />
      <Route path=":id/edit" element={<BedForm />} />
    </Routes>
  );
};

export default BedManagement;