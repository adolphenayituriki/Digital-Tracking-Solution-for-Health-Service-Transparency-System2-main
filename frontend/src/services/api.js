import axios from "axios";

const BASE_URL = "http://localhost:8000"; // adjust if backend URL is different

const API = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication
export const login = (username, password) => API.post("/auth/login", { username, password });

// Example: get current user info (optional, for auto-login)
export const getCurrentUser = () => API.get("/auth/me");

// Core API functions
export const getShipments = () => API.get("/shipments/");
export const getFeedbacks = () => API.get("/feedbacks/");
export const getIssues = () => API.get("/issues/");
export const getAuditTrail = () => API.get("/audit_trails/");
export const postFeedback = (data) => API.post("/feedbacks/", data);

// Dashboard aliases (for backward compatibility)
export const getDashboardShipments = () => getShipments();
export const getDashboardAuditTrails = () => getAuditTrail();
export const getDashboardFeedbacks = () => getFeedbacks();
export const getDashboardIssues = () => getIssues();


// NEW FUNCTION: Fetch all data for the dashboard in one go
export const getOfficialDashboardData = async () => {
  try {
    const [
      shipmentsRes,
      feedbacksRes,
      issuesRes,
      auditRes
    ] = await Promise.all([
      API.get("/shipments/"),
      API.get("/feedbacks/"),
      API.get("/issues/"),
      API.get("/audit_trails/")
    ]);

    // Count different types of data
    const totalShipments = shipmentsRes.data.length;
    const totalFeedbacks = feedbacksRes.data.length;
    const totalIssues = issuesRes.data.length;

    // Assuming your shipments have a 'status' field
    const totalDelivered = shipmentsRes.data.filter(s => s.status === 'delivered').length;
    const totalDelayed = shipmentsRes.data.filter(s => s.status === 'delayed').length;

    // Assuming your feedback has a 'sentiment' or 'type' field
    const totalPositiveFeedback = feedbacksRes.data.filter(f => f.sentiment === 'positive').length;
    const totalNegativeFeedback = feedbacksRes.data.filter(f => f.sentiment === 'negative').length;

    return {
      data: {
        total_shipments: totalShipments,
        total_delivered: totalDelivered,
        total_delayed: totalDelayed,
        total_feedbacks: totalFeedbacks,
        total_positive_feedback: totalPositiveFeedback,
        total_negative_feedback: totalNegativeFeedback,
        // You can add more data here as needed for charts, tables etc.
        recent_shipments: shipmentsRes.data.slice(0, 5), // Get the 5 most recent shipments
        shipment_data: shipmentsRes.data,
        feedback_data: feedbacksRes.data,
        audit_trail_data: auditRes.data,
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Re-throw the error so the component can handle it
    throw error;
  }
};

export default API;