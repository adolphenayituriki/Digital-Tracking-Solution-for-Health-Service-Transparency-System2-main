import React, { useEffect, useState } from "react";
import api from "../axiosConfig"; // <- use token-enabled axios

function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get("/shipments/"); // fetch shipments with token
        const delayed = res.data.filter((s) => s.status === "Delayed").length;
        const lost = res.data.filter((s) => s.status === "Lost").length;
        const alertList = [];

        if (delayed) alertList.push({ type: "warning", message: `${delayed} shipments delayed.` });
        if (lost) alertList.push({ type: "danger", message: `${lost} shipments lost.` });
        if (!delayed && !lost) alertList.push({ type: "success", message: "All systems normal." });

        setAlerts(alertList);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      }
    };

    fetchAlerts();
  }, []);

  const colorMap = { warning: "#FFC107", danger: "#DC3545", success: "#28A745" };

  return (
    <div>
      {alerts.map((alert, index) => (
        <div
          key={index}
          style={{
            backgroundColor: colorMap[alert.type],
            color: "white",
            padding: "10px",
            marginBottom: "8px",
            borderRadius: "8px",
          }}
        >
          {alert.message}
        </div>
      ))}
    </div>
  );
}

export default AlertsPanel;
