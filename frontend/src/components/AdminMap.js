import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api";

export default function AdminMap() {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    api.get("/shipments/live").then((res) => setShipments(res.data));
  }, []);

  return (
    <div style={{ height: "90vh", width: "100%" }}>
      <MapContainer center={[ -1.9403, 29.8739]} zoom={8} scrollWheelZoom={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {shipments.map((s) => (
          <Marker key={s.id} position={[s.latitude, s.longitude]}>
            <Popup>
              <b>Shipment ID:</b> {s.id} <br />
              <b>Status:</b> {s.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
