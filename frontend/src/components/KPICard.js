import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import "../styles.css";

ChartJS.register(ArcElement, Tooltip);

export default function KPICard({ title, value, icon, chartData, trend, type }) {
  // Determine border color based on type
  const borderColors = {
    total: "#007bff",
    deliveries: "#28a745",
    alerts: "#ffc107",
    resolved: "#17a2b8",
  };

  return (
    <div
      className={`kpi-card ${type}`}
      style={{ borderLeft: `5px solid ${borderColors[type] || "#007bff"}` }}
    >
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <div className="kpi-title">{title}</div>
        <div className="kpi-value">{value}</div>
        {chartData && (
          <div className="kpi-chart">
            <Doughnut
              data={chartData}
              options={{
                cutout: "70%",
                plugins: { legend: { display: false } },
              }}
            />
            <div className="kpi-percentage">
              {chartData.datasets[0].data[0]}%
            </div>
          </div>
        )}
        {trend !== undefined && (
          <div className={`kpi-trend ${trend >= 0 ? "positive" : "negative"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}
