import './styles.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CitizenDashboard from './pages/CitizenDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import OfficialDashboard from './pages/OfficialDashboard';

// PrivateRoute component
const PrivateRoute = ({ children, user, requiredRole }) => {
  if (!user || user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/citizen"
          element={
            <PrivateRoute user={user} requiredRole="citizen">
              <CitizenDashboard user={user} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/distributor"
          element={
            <PrivateRoute user={user} requiredRole="distributor">
              <DistributorDashboard user={user} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/official"
          element={
            <PrivateRoute user={user} requiredRole="official">
              <OfficialDashboard user={user} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
