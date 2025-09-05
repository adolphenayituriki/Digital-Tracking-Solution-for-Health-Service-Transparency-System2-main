// src/components/TrackingMap.js
import React from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Define colors for shipment statuses
const statusColors = {
  delivered: "green",
  pending: "orange",
  delayed: "red",
  missing: "gray",
};

function TrackingMap({ scannedShipments }) {
  // Default map center (you can set to main warehouse coordinates)
  const defaultCenter = { lat: -1.9403, lng: 29.8739 };
  const zoom = 7;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={zoom}
      style={{ width: "100%", height: "400px", borderRadius: "8px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {scannedShipments.map((shipment) => {
        const color = statusColors[shipment.status] || "blue";
        return (
          <CircleMarker
            key={shipment.id}
            center={[shipment.lat, shipment.lng]}
            radius={8}
            color={color}
            fillColor={color}
            fillOpacity={0.7}
          >
            <Popup>
              <div>
                <strong>Shipment ID:</strong> {shipment.id}<br />
                <strong>Status:</strong> {shipment.status || "scanned"}<br />
                <strong>Scanned by:</strong> {shipment.personnel || "N/A"}<br />
                <strong>Time:</strong> {new Date(shipment.timestamp).toLocaleString()}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

export default TrackingMap;
