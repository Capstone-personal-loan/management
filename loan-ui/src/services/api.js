import axios from "axios";

// =============================================
// API BASE URL CONFIGURATION
// For LOCAL development: http://localhost:8081
// For RENDER deployment: replace with your render URL
// Example: https://your-app-name.onrender.com
// =============================================
const BASE_URL = "https://management-yq12.onrender.com"; // To switch to Render, either:
// 1. Set REACT_APP_API_URL in a .env file
// 2. Or directly replace the URL above with your Render backend URL

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem("loanUser") || "{}");
  if (user.email && user.password) {
    return {
      Authorization: "Basic " + btoa(user.email + ":" + user.password),
    };
  }
  return {};
};

const api = axios.create({ baseURL: BASE_URL });

// AUTH
export const registerUser = (data) => api.post("/api/auth/register", data);
export const loginUser = (email, password) =>
  api.post("/api/auth/login", { email, password });

// USER LOANS
export const applyForLoan = (data) =>
  api.post("/api/loans/apply", data, { headers: getAuthHeader() });

export const getMyApplications = () =>
  api.get("/api/loans/my", { headers: getAuthHeader() });

export const getEmiSchedule = (applicationId) =>
  api.get(`/api/loans/${applicationId}/emi`, { headers: getAuthHeader() });

export const getLoanAccount = (applicationId) =>
  api.get(`/api/loans/${applicationId}/account`, { headers: getAuthHeader() });

export const makePayment = (data) =>
  api.post("/api/loans/pay", data, { headers: getAuthHeader() });

export const getPaymentHistory = (applicationId) =>
  api.get(`/api/loans/${applicationId}/payments`, { headers: getAuthHeader() });

// ADMIN
export const getAllApplications = () =>
  api.get("/api/admin/applications", { headers: getAuthHeader() });

export const reviewApplication = (applicationId, data) =>
  api.put(`/api/admin/applications/${applicationId}/review`, data, {
    headers: getAuthHeader(),
  });
