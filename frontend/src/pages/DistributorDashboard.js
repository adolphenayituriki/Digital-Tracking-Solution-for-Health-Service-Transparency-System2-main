// src/pages/DistributorDashboard.js
import React, { useState, useEffect } from "react";
import ShipmentTable from "../components/ShipmentTable";
import TrackingMap from "../components/TrackingMap";
import AlertsPanel from "../components/AlertsPanel";
import QrReader from "modern-react-qr-reader";
import api from "../axiosConfig";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

function DistributorDashboard({ user, onLogout }) {
  const [scanResult, setScanResult] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [message, setMessage] = useState("");
  const [scannedShipments, setScannedShipments] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanningEnabled, setScanningEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch shipments assigned to the distributor
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get("/shipments/")
      .then((res) => {
        const assignedShipments = res.data.filter((s) => s.distributor_id === user.id);
        setShipments(assignedShipments);
      })
      .catch((err) => {
        console.error(err);
        setShipments([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Get geolocation
  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setLocation(loc);
            resolve(loc);
          },
          () => {
            setMessage("Enable location to scan shipments.");
            reject("Location denied");
          }
        );
      } else reject("Geolocation not supported");
    });

  // Handle QR scan
  const handleScan = async (data) => {
    if (!data || !scanningEnabled) return;
    setScanResult(data);
    setScanningEnabled(false);

    try {
      const loc = await getLocation();
      const payload = {
        personnel: user.username,
        checkpoint: "Distributor Checkpoint",
        timestamp: new Date().toISOString(),
        latitude: loc.lat,
        longitude: loc.lng,
      };

      await api.post(`/shipments/${data}/scan`, payload);
      setMessage(`Shipment ${data} scanned successfully!`);

      setScannedShipments((prev) => [
        ...prev,
        { id: data, lat: loc.lat, lng: loc.lng, timestamp: payload.timestamp },
      ]);

      setTimeout(() => setScanningEnabled(true), 3000);
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.status === 401
          ? "Unauthorized. Please login again."
          : err.response?.data?.detail || "Scan failed."
      );
      setScanningEnabled(true);
    }
  };

  // KPI calculations
  const totalShipments = shipments.length;
  const deliveredShipments = shipments.filter((s) => s.status === "delivered").length;
  const pendingShipments = shipments.filter((s) => s.status === "pending").length;
  const delayedShipments = shipments.filter((s) => s.status === "delayed").length;
  const missingShipments = shipments.filter((s) => s.status === "missing").length;

  // Filter shipments based on search
  const filteredShipments = shipments.filter(
    (s) =>
      s.id.toString().includes(searchTerm) ||
      s.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare chart data
  const scanDates = scannedShipments.map((s) => new Date(s.timestamp).toLocaleDateString());
  const scanCounts = scanDates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const chartLabels = Object.keys(scanCounts);
  const chartData = Object.values(scanCounts);

  return (
    <div className="dashboard-container" style={{ padding: "20px" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <h2>
          Welcome, {user.username} ({user.role})
        </h2>
        <button
          onClick={onLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#DC3545",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          Logout
        </button>
      </header>

      {/* KPI Cards */}
      <section
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {[
          { label: "Total Shipments", value: totalShipments, bg: "#E3F2FD", color: "#1976D2" },
          { label: "Delivered", value: deliveredShipments, bg: "#E8F5E9", color: "#388E3C" },
          { label: "Pending", value: pendingShipments, bg: "#FFF8E1", color: "#FBC02D" },
          { label: "Delayed", value: delayedShipments, bg: "#FFEBEE", color: "#D32F2F" },
          { label: "Missing", value: missingShipments, bg: "#ECEFF1", color: "#546E7A" },
        ].map((kpi, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              minWidth: "150px",
              background: kpi.bg,
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "bold", color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: "14px", color: kpi.color, marginTop: "5px" }}>{kpi.label}</div>
          </div>
        ))}
      </section>

      {/* QR Scanner */}
      <section
        style={{
          margin: "20px 0",
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3>Scan Shipment QR Code</h3>
        <QrReader
          delay={500}
          facingMode="environment"
          onScan={handleScan}
          onError={(err) => console.error(err)}
          style={{ width: "100%", maxWidth: "350px", marginTop: "15px" }}
        />
        {scanResult && (
          <p>
            <strong>Scanned Shipment ID:</strong> {scanResult}
          </p>
        )}
        {message && <p>{message}</p>}
      </section>

      {/* Live Map */}
      <section style={{ margin: "20px 0" }}>
        <h3>Live Map of Scanned Shipments</h3>
        <TrackingMap scannedShipments={scannedShipments} />
      </section>

      {/* Search Box */}
      <section style={{ margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Search by ID, status, or item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
      </section>

      {/* Shipment Table */}
      <section style={{ margin: "20px 0" }}>
        <h3>Assigned Shipments</h3>
        <ShipmentTable shipments={filteredShipments} loading={loading} />
      </section>

      {/* Alerts Panel */}
      <section style={{ margin: "20px 0" }}>
        <h3>Alerts</h3>
        <AlertsPanel />
      </section>

      {/* Scan Trend Chart */}
      <section style={{ margin: "20px 0" }}>
        <h3>Daily Scan Trend</h3>
        <Line
          data={{
            labels: chartLabels,
            datasets: [
              {
                label: "Scans per Day",
                data: chartData,
                backgroundColor: "#4CAF50",
                borderColor: "#006633",
                fill: true,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true, position: "top" },
              title: { display: false },
            },
            scales: {
              x: { title: { display: true, text: "Date" } },
              y: { title: { display: true, text: "Number of Scans" }, beginAtZero: true },
            },
          }}
        />
      </section>
    </div>
  );
}

export default DistributorDashboard;
