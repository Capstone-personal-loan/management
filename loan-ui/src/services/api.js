import axios from "axios";

const BASE_URL = "https://management-yq12.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("loanUser") || "{}");

  if (user.email && user.password) {
    config.headers.Authorization =
      "Basic " + btoa(user.email + ":" + user.password);
  }

  return config;
});

// ================= AUTH =================
export const registerUser = (data) => api.post("/api/auth/register", data);

export const loginUser = async (email, password) => {
  const res = await api.post("/api/auth/login", { email, password });

  // ✅ STORE credentials (VERY IMPORTANT)
  localStorage.setItem("loanUser", JSON.stringify({ email, password }));

  return res;
};

// ================= USER =================
export const applyForLoan = (data) => api.post("/api/loans/apply", data);

export const getMyApplications = () => api.get("/api/loans/my");

export const getEmiSchedule = (applicationId) =>
  api.get(`/api/loans/${applicationId}/emi`);

export const getLoanAccount = (applicationId) =>
  api.get(`/api/loans/${applicationId}/account`);

export const makePayment = (data) => api.post("/api/loans/pay", data);

export const getPaymentHistory = (applicationId) =>
  api.get(`/api/loans/${applicationId}/payments`);

// ================= ADMIN =================
export const getAllApplications = () => api.get("/api/admin/applications");

export const reviewApplication = (applicationId, data) =>
  api.put(`/api/admin/applications/${applicationId}/review`, data);

export default api;
