import React, { useEffect, useState } from "react";
import axios from "axios";
import KPICard from "../components/KPICard";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  FaUsers,
  FaTruck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "../styles.css";

// Register chart types
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// ... keep imports same as before ...

export default function OfficialDashboard({ user, onLogout }) {
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [totalShipments, setTotalShipments] = useState(0);
  const [dispatched, setDispatched] = useState(0);
  const [delivered, setDelivered] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [shipments, setShipments] = useState([]);

  // 👉 Mock fallback data
  const mockShipments = [
    { id: 101, status: "delivered", latitude: -1.95, longitude: 30.09, timestamp: new Date() },
    { id: 102, status: "pending", latitude: -1.96, longitude: 30.1, timestamp: new Date() },
    { id: 103, status: "delayed", latitude: -1.97, longitude: 30.08, timestamp: new Date() },
    { id: 104, status: "dispatched", latitude: -1.99, longitude: 30.12, timestamp: new Date() },
  ];

  // 👉 Mock daily shipment stats (last 7 days)
  const mockDailyData = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
    shipments: Math.floor(Math.random() * 15) + 5, // between 5–20 shipments
    delivered: Math.floor(Math.random() * 10) + 2,
  }));

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const headers = { Authorization: `Bearer ${token}` };

    // Keep DB data for beneficiaries
    axios
      .get("http://localhost:8000/beneficiaries/total", { headers })
      .then((res) => setTotalBeneficiaries(res.data.total))
      .catch((err) => console.error(err));

    // Keep DB data for shipments, fallback to mock
    axios
      .get("http://localhost:8000/shipments/", { headers })
      .then((res) => {
        if (res.data.length > 0) {
          setShipments(res.data);
          const deliveredCount = res.data.filter(
            (s) => s.status.toLowerCase() === "delivered"
          ).length;
          setDelivered(deliveredCount);
          setDispatched(res.data.length - deliveredCount);
          setTotalShipments(res.data.length);
        } else {
          setShipments(mockShipments);
          setTotalShipments(mockShipments.length);
          setDelivered(1);
          setDispatched(3);
        }
      })
      .catch(() => {
        setShipments(mockShipments);
        setTotalShipments(mockShipments.length);
        setDelivered(1);
        setDispatched(3);
      });

    // 👉 Mock Feedbacks
    setFeedbacks([
      { id: 1, category: "delayed", message: "Shipment #102 delayed at checkpoint" },
      { id: 2, category: "missing", message: "Shipment #87 missing items" },
      { id: 3, category: "other", message: "Great service in Cell Gishari" },
      { id: 4, category: "delayed", message: "Shipment #110 delayed due to weather" },
    ]);

    // 👉 Mock Alerts
    setAlerts([
      { id: 201, message: "Suspicious route for Shipment #54", type: "warning" },
      { id: 202, message: "Shipment #77 flagged for double scanning", type: "warning" },
      { id: 203, message: "High-value shipment #120 not verified", type: "critical" },
    ]);

    // 👉 Mock Audit Trail
    setAuditTrail([
      { record_id: 54, action: "Created", user: "Admin", timestamp: new Date().toISOString() },
      { record_id: 54, action: "Dispatched", user: "Cyprien", timestamp: new Date().toISOString() },
      { record_id: 77, action: "Delivered", user: "Adolphe", timestamp: new Date().toISOString() },
      { record_id: 87, action: "Updated", user: "Chantal", timestamp: new Date().toISOString() },
      { record_id: 87, action: "Scanned", user: "Erneste", timestamp: new Date().toISOString() },
         { record_id: 87, action: "Updated", user: "Olivier", timestamp: new Date().toISOString() },
    ]);
  }, []);

  // 👉 Chart data with fallback
  const deliveryData = {
    labels: ["Dispatched", "Delivered"],
    datasets: [
      {
        data: [dispatched || 5, delivered || 2],
        backgroundColor: ["#FFC107", "#4CAF50"],
      },
    ],
  };

  const feedbackData = {
    labels: ["Delayed", "Missing", "Other"],
    datasets: [
      {
        data: [
          feedbacks.filter((f) => f.category === "delayed").length,
          feedbacks.filter((f) => f.category === "missing").length,
          feedbacks.filter((f) => f.category === "other").length,
        ],
        backgroundColor: ["#F44336", "#FF9800", "#2196F3"],
      },
    ],
  };

  const dailyShipmentsData = {
    labels: mockDailyData.map((d) => d.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })),
    datasets: [
      {
        label: "Shipments",
        data: mockDailyData.map((d) => d.shipments),
        borderColor: "#4CAF50",
        backgroundColor: "#A5D6A7",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Delivered",
        data: mockDailyData.map((d) => d.delivered),
        borderColor: "#2196F3",
        backgroundColor: "#90CAF9",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>
          Welcome, {user.username} ({user.role})
        </h2>
        <button
          onClick={onLogout}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            background: "#007bff",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard title="Total Beneficiaries" value={totalBeneficiaries} icon={<FaUsers />} type="total" />
        <KPICard title="Shipments" value={totalShipments} icon={<FaTruck />} chartData={deliveryData} type="deliveries" />
        <KPICard title="Feedback Reports" value={feedbacks.length} icon={<FaExclamationTriangle />} chartData={feedbackData} type="alerts" />
        <KPICard title="Suspicious Shipments" value={alerts.length} icon={<FaCheckCircle />} type="resolved" />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Daily Shipments</h3>
          <Line data={dailyShipmentsData} />
        </div>
        <div className="chart-card">
          <h3>Dispatched vs Delivered</h3>
          <Bar data={deliveryData} />
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="alerts-panel">
        <h3>Recent Alerts</h3>
        <ul>
          {alerts.map((a) => (
            <li key={a.id} className={`alert-${a.type}`}>
              {a.message}
            </li>
          ))}
        </ul>
      </div>

      {/* Audit Trail */}
            {/* Audit Trail */}
      <div className="audit-trail bg-white rounded-2xl shadow-md p-4 mt-6">
        <h3 className="text-lg font-bold text-gray-700 mb-3">
          Audit Trail (Latest Logs)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">Shipment ID</th>
                <th className="px-4 py-2 border">Action</th>
                <th className="px-4 py-2 border">User</th>
                <th className="px-4 py-2 border">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditTrail.map((log, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="px-4 py-2 border font-medium">{log.record_id}</td>
                  <td
                    className={`px-4 py-2 border font-semibold
                      ${log.action === "Created" ? "text-blue-600" : ""}
                      ${log.action === "Dispatched" ? "text-yellow-600" : ""}
                      ${log.action === "Delivered" ? "text-green-600" : ""}
                      ${log.action === "Updated" ? "text-purple-600" : ""}
                      ${log.action === "Flagged" ? "text-red-600" : ""}`}
                  >
                    {log.action}
                  </td>
                  <td className="px-4 py-2 border">{log.user}</td>
                  <td className="px-4 py-2 border text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Live Map */}
      <div className="map-placeholder">
        <h3>
          <FaMapMarkedAlt /> Live Map of Shipments
        </h3>
        <MapContainer center={[-1.9577, 30.1127]} zoom={13} className="map-box">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          />
          {(shipments.length ? shipments : mockShipments).map((s) => (
            <Marker key={s.id} position={[s.latitude || -1.9577, s.longitude || 30.1127]}>
              <Popup>
                Shipment ID {s.id} - {s.status}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
