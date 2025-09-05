import React, { useEffect, useState } from "react";
import { getDashboardAuditTrails } from "../services/api";
function AuditTrail() {
  const [audits, setAudits] = useState([]);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const res = await getDashboardAuditTrails();
        setAudits(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAudits();
  }, []);

  return (
    <div>
      {audits.length ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Table</th>
              <th>Record</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((a) => (
              <tr key={a.id}>
                <td>{a.user_id}</td>
                <td>{a.action}</td>
                <td>{a.table_name}</td>
                <td>{a.record_id}</td>
                <td>{new Date(a.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No recent audit records.</p>
      )}
    </div>
  );
}

export default AuditTrail;
