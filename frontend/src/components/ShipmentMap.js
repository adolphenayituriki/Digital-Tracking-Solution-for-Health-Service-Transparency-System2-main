import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles.css';

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function ShipmentMap({ shipments }) {
  // Default map center if no shipments
  const defaultPosition = [ -1.944, 30.061 ]; // Example: Kigali center
  const mapCenter = shipments.length > 0 
    ? [shipments[0].latitude, shipments[0].longitude] 
    : defaultPosition;

  return (
    <div style={{ height: '300px', width: '100%', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {shipments.map(s => s.latitude && s.longitude && (
          <Marker key={s.id} position={[s.latitude, s.longitude]}>
            <Popup>
              <strong>{s.item_name}</strong><br />
              Status: {s.status || 'Pending'}<br />
              Quantity: {s.quantity_kg || '-'} kg
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default ShipmentMap;
