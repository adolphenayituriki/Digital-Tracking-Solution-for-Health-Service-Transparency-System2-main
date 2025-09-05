// src/pages/AdminDashboard.js
import React, { useEffect, useMemo, useState } from "react";
import api from "../axiosConfig";
import "../styles.css"; // you can move the styles at the bottom into your CSS file if you prefer
import { useNavigate } from "react-router-dom";

/**
 * AdminDashboard
 * - Users management (list, create, role, suspend/activate)
 * - Shipments management (list, assign distributor)
 * - Logs viewer (audit trail)
 * - Settings (alert thresholds)
 * - Reports export (CSV)
 *
 * Props: { user, onLogout }
 */
export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate?.() || (() => {});
  const [activeTab, setActiveTab] = useState("overview"); // overview | users | shipments | logs | reports | settings

  // Basic role guard (optional)
  useEffect(() => {
    if (!user) return;
    const allowed = ["admin", "super_admin", "superadmin"];
    if (!allowed.includes((user.role || "").toLowerCase())) {
      // redirect to home if not admin
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="admin-root">
      <AdminHeader user={user} onLogout={onLogout} />
      <div className="admin-body">
        <SidebarNav activeTab={activeTab} onChange={setActiveTab} />
        <main className="admin-main" role="main" aria-live="polite">
          {activeTab === "overview" && <OverviewPanel />}
          {activeTab === "users" && <UsersPanel />}
          {activeTab === "shipments" && <ShipmentsPanel />}
          {activeTab === "logs" && <LogsPanel />}
          {activeTab === "reports" && <ReportsPanel />}
          {activeTab === "settings" && <SettingsPanel />}
        </main>
      </div>
      <AdminFooter />
      
    </div>
  );
}

/* --------------------------- Header & Footer --------------------------- */

function AdminHeader({ user, onLogout }) {
  return (
    <header className="admin-header" role="banner">
      <div className="brand">
        <span className="brand-mark" aria-hidden>🍚</span>
        <div className="brand-text">
          <h1>AidTrack Admin</h1>
          <p>Digital Tracking for Health Service Transparency</p>
        </div>
      </div>

      <div className="header-actions">
        <div className="profile" aria-label="Signed in user">
          <div className="avatar" aria-hidden>{(user?.username || "A")[0]?.toUpperCase()}</div>
          <div className="who">
            <div className="username">{user?.username || "Admin"}</div>
            <div className="role">{user?.role || "admin"}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="btn btn-danger"
          aria-label="Logout of the admin panel"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

function AdminFooter() {
  return (
    <footer className="admin-footer" role="contentinfo">
      <div className="footer-grid">
        <div>
          <div className="foot-title">Project</div>
          <div>Digital Tracking Solution for Health Service Transparency</div>
        </div>
        <div>
          <div className="foot-title">Contacts</div>
          <div>Mentor: Fiston Munyampeta — mfiston2020@gmail.com — 0782009474</div>
          <div>Team Lead: Cyprien Yankurije — yankurijecyprien76@gmail.com — 0789294965</div>
        </div>
        <div>
          <div className="foot-title">About</div>
          <div>Transparency • Accountability • Timely Delivery</div>
        </div>
      </div>
      <div className="foot-meta">© {new Date().getFullYear()} AidTrack. All rights reserved.</div>
    </footer>
  );
}

/* ------------------------------ Sidebar ------------------------------- */

function SidebarNav({ activeTab, onChange }) {
  const items = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "shipments", label: "Shipments" },
    { id: "logs", label: "Audit Logs" },
    { id: "reports", label: "Reports" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <nav className="admin-sidebar" aria-label="Admin sections">
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <button
              className={`side-link ${activeTab === it.id ? "active" : ""}`}
              aria-current={activeTab === it.id ? "page" : undefined}
              onClick={() => onChange(it.id)}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ----------------------------- Overview ------------------------------- */

function OverviewPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Example stats aggregator (adjust endpoints to your backend)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [shipRes, userRes, alertRes] = await Promise.all([
          api.get("/shipments/"),
          api.get("/users/"),
          api.get("/alerts/").catch(() => ({ data: [] })), // optional
        ]);

        if (!mounted) return;

        const shipments = shipRes.data || [];
        const users = userRes.data || [];
        const delivered = shipments.filter(s => s.status === "delivered").length;
        const pending = shipments.filter(s => s.status === "pending").length;
        const delayed = shipments.filter(s => s.status === "delayed").length;
        const missing = shipments.filter(s => s.status === "missing").length;

        setStats({
          shipments: shipments.length,
          delivered,
          pending,
          delayed,
          missing,
          users: users.length,
          alerts: (alertRes.data || []).length,
        });
      } catch (e) {
        setStats({
          shipments: 0, delivered: 0, pending: 0, delayed: 0, missing: 0,
          users: 0, alerts: 0,
        });
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section>
      <h2 className="panel-title">System Overview</h2>
      {loading ? <div className="muted">Loading...</div> : (
        <div className="kpi-wrap">
          <KPI title="Total Shipments" value={stats.shipments} tone="info" />
          <KPI title="Delivered" value={stats.delivered} tone="success" />
          <KPI title="Pending" value={stats.pending} tone="warning" />
          <KPI title="Delayed" value={stats.delayed} tone="danger" />
          <KPI title="Missing" value={stats.missing} tone="neutral" />
          <KPI title="Total Users" value={stats.users} tone="purple" />
          <KPI title="Active Alerts" value={stats.alerts} tone="orange" />
        </div>
      )}
      <p className="muted" style={{ marginTop: 12 }}>
        Tip: Configure alert thresholds in <strong>Settings</strong> to trigger notifications for delays/irregularities.
      </p>
    </section>
  );
}

function KPI({ title, value, tone = "info" }) {
  return (
    <div className={`kpi-cardX tone-${tone}`} role="status" aria-label={`${title}: ${value}`}>
      <div className="kpi-valueX">{value}</div>
      <div className="kpi-titleX">{title}</div>
    </div>
  );
}

/* ----------------------------- Users Panel ---------------------------- */

function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", role: "citizen" });
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(u =>
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  }, [users, query]);

  const loadUsers = async () => {
    try {
      const res = await api.get("/users/");
      setUsers(res.data || []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const createUser = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/users/", form);
      setForm({ username: "", email: "", role: "citizen" });
      await loadUsers();
    } catch (e) {
      // handle server validation errors if any
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (u) => {
    setBusy(true);
    try {
      await api.patch(`/users/${u.id}/`, { active: !u.active });
      await loadUsers();
    } catch (e) {
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <h2 className="panel-title">Users</h2>

      <div className="toolbar">
        <input
          type="search"
          aria-label="Search users"
          className="input"
          placeholder="Search by username, email, role…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid-2">
        <form onSubmit={createUser} className="card">
          <h3>Create User</h3>
          <label className="label">
            <span>Username</span>
            <input
              required
              className="input"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </label>
          <label className="label">
            <span>Email</span>
            <input
              required
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="label">
            <span>Role</span>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="citizen">Citizen</option>
              <option value="distributor">Distributor</option>
              <option value="official">Official</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button className="btn btn-primary" disabled={busy} aria-busy={busy}>
            {busy ? "Saving…" : "Create User"}
          </button>
        </form>

        <div className="card">
          <h3>All Users</h3>
          <div className="table-wrap" role="region" aria-label="Users table">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th aria-label="Actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <span className={`badge ${u.active ? "ok" : "muted"}`}>
                        {u.active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        onClick={() => toggleActive(u)}
                        aria-label={u.active ? "Suspend user" : "Activate user"}
                        title={u.active ? "Suspend" : "Activate"}
                      >
                        {u.active ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="muted">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Shipments Panel -------------------------- */

function ShipmentsPanel() {
  const [shipments, setShipments] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [assign, setAssign] = useState({ shipment_id: "", distributor_id: "" });
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return shipments.filter(s =>
      s.id?.toString().includes(q) ||
      (s.status || "").toLowerCase().includes(q) ||
      (s.item_name || "").toLowerCase().includes(q)
    );
  }, [shipments, query]);

  const load = async () => {
    try {
      const [shipRes, userRes] = await Promise.all([
        api.get("/shipments/"),
        api.get("/users/"),
      ]);
      setShipments(shipRes.data || []);
      setDistributors((userRes.data || []).filter(u => (u.role || "").toLowerCase() === "distributor"));
    } catch {
      setShipments([]);
      setDistributors([]);
    }
  };

  useEffect(() => { load(); }, []);

  const assignShipment = async (e) => {
    e.preventDefault();
    if (!assign.shipment_id || !assign.distributor_id) return;
    try {
      // adjust to your backend route
      await api.post("/shipments/assign", {
        shipment_id: Number(assign.shipment_id),
        distributor_id: Number(assign.distributor_id),
      });
      setAssign({ shipment_id: "", distributor_id: "" });
      await load();
    } catch (e) {
      // handle error UI
    }
  };

  return (
    <section>
      <h2 className="panel-title">Shipments</h2>

      <div className="toolbar">
        <input
          type="search"
          className="input"
          placeholder="Search by ID, status, or item…"
          aria-label="Search shipments"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid-2">
        <form onSubmit={assignShipment} className="card">
          <h3>Assign to Distributor</h3>
          <label className="label">
            <span>Shipment</span>
            <select
              className="input"
              value={assign.shipment_id}
              onChange={(e) => setAssign({ ...assign, shipment_id: e.target.value })}
              required
            >
              <option value="">Select shipment…</option>
              {shipments.map(s => (
                <option key={s.id} value={s.id}>
                  #{s.id} — {s.item_name || "Item"} ({s.status || "status"})
                </option>
              ))}
            </select>
          </label>

          <label className="label">
            <span>Distributor</span>
            <select
              className="input"
              value={assign.distributor_id}
              onChange={(e) => setAssign({ ...assign, distributor_id: e.target.value })}
              required
            >
              <option value="">Select distributor…</option>
              {distributors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.username} (#{d.id})
                </option>
              ))}
            </select>
          </label>

          <button className="btn btn-primary">Assign</button>
        </form>

        <div className="card">
          <h3>All Shipments</h3>
          <div className="table-wrap" role="region" aria-label="Shipments table">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Item</th>
                  <th>Qty (kg)</th>
                  <th>Distributor</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td><StatusPill status={s.status} /></td>
                    <td>{s.item_name || "-"}</td>
                    <td>{s.quantity_kg ?? "-"}</td>
                    <td>{s.distributor_id ? `#${s.distributor_id}` : <span className="muted">Unassigned</span>}</td>
                    <td>{s.created_at ? new Date(s.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="muted">No shipments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusPill({ status }) {
  const s = (status || "").toLowerCase();
  const map = {
    delivered: "ok",
    pending: "warn",
    delayed: "danger",
    missing: "neutral",
    "in transit": "info",
  };
  return <span className={`badge ${map[s] || "muted"}`}>{status || "unknown"}</span>;
}

/* ------------------------------ Logs Panel ---------------------------- */

function LogsPanel() {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // adjust to your backend endpoint
        const res = await api.get("/logs/");
        setLogs(res.data || []);
      } catch {
        setLogs([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return logs.filter(l =>
      (l.event || "").toLowerCase().includes(q) ||
      (l.personnel || "").toLowerCase().includes(q) ||
      (l.checkpoint || "").toLowerCase().includes(q) ||
      String(l.shipment_id || "").includes(q)
    );
  }, [logs, query]);

  return (
    <section>
      <h2 className="panel-title">Audit Logs</h2>

      <div className="toolbar">
        <input
          type="search"
          className="input"
          placeholder="Search by event, checkpoint, personnel or shipment ID…"
          aria-label="Search logs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-wrap" role="region" aria-label="Audit log table">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Shipment</th>
                <th>Event</th>
                <th>Checkpoint</th>
                <th>Personnel</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr key={i}>
                  <td>{l.timestamp ? new Date(l.timestamp).toLocaleString() : "-"}</td>
                  <td>{l.shipment_id ?? "-"}</td>
                  <td>{l.event || "-"}</td>
                  <td>{l.checkpoint || "-"}</td>
                  <td>{l.personnel || "-"}</td>
                  <td>{l.latitude && l.longitude ? `${l.latitude.toFixed?.(4)}, ${l.longitude.toFixed?.(4)}` : "-"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="muted">No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Reports Panel --------------------------- */

function ReportsPanel() {
  const [range, setRange] = useState({ from: "", to: "" });
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);

  const getReports = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      // Adjust endpoint and params to your backend
      const res = await api.get("/reports/shipments", { params: { from: range.from, to: range.to } });
      setRows(res.data || []);
    } catch {
      setRows([]);
    } finally {
      setBusy(false);
    }
  };

  const exportCSV = () => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map(r => headers.map(h => csvEscape(r[h])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aidtrack-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <h2 className="panel-title">Reports</h2>
      <form onSubmit={getReports} className="card grid-3-compact">
        <label className="label">
          <span>From</span>
          <input type="date" className="input" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        </label>
        <label className="label">
          <span>To</span>
          <input type="date" className="input" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        </label>
        <div className="label" style={{ alignSelf: "end" }}>
          <button className="btn btn-primary" disabled={busy} aria-busy={busy}>
            {busy ? "Loading…" : "Generate"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={exportCSV} disabled={!rows.length} style={{ marginLeft: 8 }}>
            Export CSV
          </button>
        </div>
      </form>

      <div className="card">
        <div className="table-wrap" role="region" aria-label="Report results">
          <table className="table">
            <thead>
              <tr>
                {rows[0] ? Object.keys(rows[0]).map((h) => <th key={h}>{startCase(h)}</th>) : <th>No data</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  {Object.keys(rows[0] || {}).map((h) => <td key={h}>{String(r[h] ?? "-")}</td>)}
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className="muted">Run a report to see results.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Settings Panel --------------------------- */

function SettingsPanel() {
  const [settings, setSettings] = useState({
    delay_threshold_minutes: 120,
    lost_retries: 2,
    notify_email: "",
  });
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/settings");
        if (res?.data) setSettings(res.data);
      } catch {
        /* ignore, keep defaults */
      }
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setOk("");
    try {
      await api.post("/admin/settings", settings);
      setOk("Settings saved.");
    } catch {
      setOk("Failed to save settings.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <h2 className="panel-title">Settings</h2>
      <form onSubmit={save} className="card grid-3-compact">
        <label className="label">
          <span>Delay Threshold (minutes)</span>
          <input
            type="number"
            min="0"
            className="input"
            value={settings.delay_threshold_minutes}
            onChange={(e) => setSettings({ ...settings, delay_threshold_minutes: Number(e.target.value) })}
          />
        </label>
        <label className="label">
          <span>Lost Retries (before alert)</span>
          <input
            type="number"
            min="0"
            className="input"
            value={settings.lost_retries}
            onChange={(e) => setSettings({ ...settings, lost_retries: Number(e.target.value) })}
          />
        </label>
        <label className="label">
          <span>Notify Email</span>
          <input
            type="email"
            placeholder="cyprien@gmail.com"
            className="input"
            value={settings.notify_email}
            onChange={(e) => setSettings({ ...settings, notify_email: e.target.value })}
          />
        </label>
        <div className="label" style={{ alignSelf: "end" }}>
          <button className="btn btn-primary" disabled={busy} aria-busy={busy}>
            {busy ? "Saving…" : "Save Settings"}
          </button>
          {ok && <span className="muted" style={{ marginLeft: 10 }}>{ok}</span>}
        </div>
      </form>
    </section>
  );
}

/* ------------------------------ Helpers ------------------------------- */

function csvEscape(value) {
  if (value == null) return "";
  const str = String(value).replace(/"/g, '""');
  return /[",\n]/.test(str) ? `"${str}"` : str;
}

function startCase(key) {
  return String(key).replace(/[_-]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
