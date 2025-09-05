import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

// Fix default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const AdminMap = () => {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    // Fetch live shipments from backend
    const fetchShipments = async () => {
      try {
        const res = await axios.get(
          `${process.env.VITE_API_BASE}/dashboard/shipments/live`
        );
        setShipments(res.data);
      } catch (err) {
        console.error("Error fetching shipments:", err);
      }
    };

    fetchShipments();
    const interval = setInterval(fetchShipments, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer
      center={[ -1.9441, 30.0619 ]} // Default center, e.g., Kigali
      zoom={12}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {shipments.map((s) => (
        <Marker
          key={s.id}
          position={[s.latitude || 0, s.longitude || 0]}
        >
          <Popup>
            <strong>Shipment ID:</strong> {s.id}<br />
            <strong>Status:</strong> {s.status}<br />
            <strong>Last update:</strong> {s.timestamp}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default AdminMap;
