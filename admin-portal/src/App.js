import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import ManageJobs from './pages/ManageJobs';
import ExportData from './pages/ExportData';
import AdminLogin from './pages/AdminLogin';
import JobRoles from './pages/JobRoles';
import Evaluation from './pages/Evaluation';
import SelectedCandidates from './pages/SelectedCandidates';
import EventRegistrations from './pages/EventRegistrations';

import ManageEvents from './pages/ManageEvents';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/admin-login" replace />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-manage-events" element={<ManageEvents />} />
          <Route path="/admin-manage-jobs" element={<ManageJobs />} />
          <Route path="/admin-export-data" element={<ExportData />} />
          <Route path="/admin-job-roles" element={<JobRoles />} />
          <Route path="/admin-evaluation" element={<Evaluation />} />
          <Route path="/admin-selected-candidates" element={<SelectedCandidates />} />
          <Route path="/admin-event-registrations" element={<EventRegistrations />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
