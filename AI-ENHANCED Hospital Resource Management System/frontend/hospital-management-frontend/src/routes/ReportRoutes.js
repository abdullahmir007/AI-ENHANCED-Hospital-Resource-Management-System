import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Reports from '../pages/Reports';
import ReportDetail from '../pages/ReportDetail';

const ReportRoutes = () => {
  return (
    <Routes>
      <Route index element={<Reports />} />
      <Route path=":reportType" element={<ReportDetail />} />
    </Routes>
  );
};

export default ReportRoutes;