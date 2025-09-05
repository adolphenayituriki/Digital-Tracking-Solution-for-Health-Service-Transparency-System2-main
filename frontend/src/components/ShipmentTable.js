// src/components/ShipmentTable.js
import React from "react";

function ShipmentTable({ shipments, loading }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
        return { color: "#006633", fontWeight: "bold" }; // Green
      case "pending":
        return { color: "#FFB300", fontWeight: "bold" }; // Yellow
      case "delayed":
        return { color: "#B71C1C", fontWeight: "bold" }; // Red
      case "missing":
        return { color: "#757575", fontWeight: "bold" }; // Gray
      default:
        return {};
    }
  };

  if (loading) {
    return <p>Loading shipments...</p>;
  }

  if (shipments.length === 0) {
    return <p>No shipments assigned or found.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "10px",
          minWidth: "700px",
        }}
      >
        <thead style={{ backgroundColor: "#E0F2F1" }}>
          <tr>
            <th style={thStyle}>Shipment ID</th>
            <th style={thStyle}>Item Name</th>
            <th style={thStyle}>Quantity</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Last Scan Location</th>
            <th style={thStyle}>Last Scan Timestamp</th>
            <th style={thStyle}>Personnel</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => {
            const lastScan = s.scans?.length
              ? s.scans[s.scans.length - 1]
              : null;
            const location = lastScan
              ? `${lastScan.latitude.toFixed(4)}, ${lastScan.longitude.toFixed(
                  4
                )}`
              : "Rusizi";
            const timestamp = lastScan
              ? new Date(lastScan.timestamp).toLocaleString()
              : "23/08/2025,19:00";
            const personnel = lastScan ? lastScan.personnel : "CYPRIEN";

            return (
              <tr key={s.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={tdStyle}>{s.id}</td>
                <td style={tdStyle}>{s.item_name}</td>
                <td style={tdStyle}>{s.quantity}</td>
                <td style={{ ...tdStyle, ...getStatusStyle(s.status) }}>
                  {s.status}
                </td>
                <td style={tdStyle}>{location}</td>
                <td style={tdStyle}>{timestamp}</td>
                <td style={tdStyle}>{personnel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "2px solid #006633",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #ccc",
};

export default ShipmentTable;
