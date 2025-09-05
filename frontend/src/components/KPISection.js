import React, { useEffect, useState } from 'react';
import { getShipments, getIssues } from '../services/api';
import { getDashboardIssues } from "../services/api";

import { FaTruck, FaCheckCircle, FaClock, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

function KPISection() {
  const [kpi, setKpi] = useState({});

  useEffect(() => {
    Promise.all([getShipments(), getIssues()]).then(([shipRes, issueRes]) => {
      const shipments = shipRes.data;
      const issues = issueRes.data;
      const totalDispatched = shipments.length;
      const totalDelivered = shipments.filter(s => s.status === 'Delivered').length;
      const delayed = shipments.filter(s => s.status === 'Delayed').length;
      setKpi({
        totalDispatched,
        totalDelivered,
        deliveryRate: totalDispatched ? ((totalDelivered / totalDispatched) * 100).toFixed(1) : 0,
        delayed,
        issues: issues.length
      });
    });
  }, []);

  const kpiItems = [
    { title: 'Dispatched', value: kpi.totalDispatched, icon: <FaTruck />, color: '#007bff' },
    { title: 'Delivered', value: kpi.totalDelivered, icon: <FaCheckCircle />, color: '#28a745' },
    { title: 'Delivery Rate', value: `${kpi.deliveryRate}%`, icon: <FaClock />, color: '#17a2b8' },
    { title: 'Delayed', value: kpi.delayed, icon: <FaExclamationTriangle />, color: '#ffc107' },
    { title: 'Issues', value: kpi.issues, icon: <FaExclamationCircle />, color: '#dc3545' },
  ];

  return (
    <div className="dashboard-cards">
      {kpiItems.map((item, index) => (
        <div key={index} className="kpi-card" style={{ borderLeft: `5px solid ${item.color}` }}>
          <div className="kpi-icon" style={{ color: item.color }}>{item.icon}</div>
          <div className="kpi-content">
            <span className="kpi-title">{item.title}</span>
            <span className="kpi-value">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default KPISection;
