import React, { useState, useEffect } from 'react';
import ShipmentTable from '../components/ShipmentTable';
import FeedbackForm from '../components/FeedbackForm';
import api from '../axiosConfig';
import '../styles.css';

function CitizenDashboard({ user, onLogout }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mockup shipments for prototype
  const mockShipments = [
    { id: 101, user_id: user?.id, status: 'delivered', item: 'Rice 50kg', timestamp: '2025-08-24T10:30:00' },
    { id: 102, user_id: user?.id, status: 'pending', item: 'Beans 20kg', timestamp: '2025-08-25T11:00:00' },
    { id: 103, user_id: user?.id, status: 'delayed', item: 'Maize 30kg', timestamp: '2025-08-26T09:15:00' },
    { id: 104, user_id: user?.id, status: 'delivered', item: 'Cooking Oil 5L', timestamp: '2025-08-23T14:00:00' },
    { id: 105, user_id: user?.id, status: 'pending', item: 'Sugar 10kg', timestamp: '2025-08-24T16:45:00' },
  ];

  // Fetch citizen's shipments
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    api.get('/shipments/')
      .then(res => {
        const userShipments = res.data.filter(s => s.user_id === user.id);
        setShipments(userShipments.length ? userShipments : mockShipments);
      })
      .catch(err => {
        console.error(err);
        // Fallback to mock shipments
        setShipments(mockShipments);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Compute shipment stats
  const totalShipments = shipments.length;
  const deliveredShipments = shipments.filter(s => s.status === 'delivered').length;
  const pendingShipments = shipments.filter(s => s.status === 'pending').length;
  const delayedShipments = shipments.filter(s => s.status === 'delayed').length;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>
          Welcome, {user.username} ({user.role})
        </h2>
        <button
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#B71C1C',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>

      {/* KPI Cards */}
      <div className="dashboard-cards">
        <div className="kpi-card total">
          <div className="kpi-icon">📦</div>
          <div className="kpi-content">
            <span className="kpi-title">Total Shipments</span>
            <span className="kpi-value">{totalShipments}</span>
          </div>
        </div>
        <div className="kpi-card deliveries">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <span className="kpi-title">Delivered</span>
            <span className="kpi-value">{deliveredShipments}</span>
          </div>
        </div>
        <div className="kpi-card alerts">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-content">
            <span className="kpi-title">Pending</span>
            <span className="kpi-value">{pendingShipments}</span>
          </div>
        </div>
        <div className="kpi-card resolved">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-content">
            <span className="kpi-title">Delayed</span>
            <span className="kpi-value">{delayedShipments}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="left-column">
          <div className="card">
            <h2>Your Shipments</h2>
            <ShipmentTable shipments={shipments} loading={loading} />
          </div>
        </div>
        <div className="right-column">
          <div className="card">
            <h2>Submit Feedback</h2>
            <FeedbackForm user={user} shipments={shipments} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CitizenDashboard;
