import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Events from './pages/Events';
import AllEvents from './pages/AllEvents';
import AllStories from './pages/AllStories';
import ApplyJob from './pages/ApplyJob';

import { CandidateAuthProvider, useCandidateAuth } from './context/CandidateAuthContext';
import CandidateLogin from './pages/CandidateLogin';

// Protected Route Wrapper
const RequireAuth = ({ children }) => {
  const { user, loading } = useCandidateAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <CandidateAuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<CandidateLogin />} />
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/all" element={<AllEvents />} />
          <Route path="/stories/all" element={<AllStories />} />
          <Route path="/:title/:department/:type" element={<ApplyJob />} />
        </Routes>
      </Router>
    </CandidateAuthProvider>
  );
}

export default App;
