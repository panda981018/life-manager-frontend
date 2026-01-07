import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://life-manager.duckdns.org/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  signup: (data) => api.post("/auth/signup", data),
};

// 일정 API
export const scheduleAPI = {
  getAll: (
    userId,
    page = 0,
    size = 10,
    sortBy = "startDatetime",
    sortDirection = "desc"
  ) =>
    api.get("/schedules", {
      headers: { "X-User-Id": userId },
      params: { page, size, sortBy, sortDirection },
    }),
  create: (userId, data) =>
    api.post("/schedules", data, {
      headers: { "X-User-Id": userId },
    }),
  update: (scheduleId, userId, data) =>
    api.put(`/schedules/${scheduleId}`, data, {
      headers: { "X-User-Id": userId },
    }),
  delete: (scheduleId, userId) =>
    api.delete(`/schedules/${scheduleId}`, {
      headers: { "X-User-Id": userId },
    }),
};

// 거래 API
export const transactionAPI = {
  getByDateRange: (
    userId,
    startDate,
    endDate,
    page = 0,
    size = 10,
    sortBy = "transactionDate",
    sortDirection = "desc"
  ) =>
    api.get("/transactions", {
      headers: { "X-User-Id": userId },
      params: { startDate, endDate, page, size, sortBy, sortDirection },
    }),
  getSummary: (userId, startDate, endDate) =>
    api.get("/transactions/summary", {
      headers: { "X-User-Id": userId },
      params: { startDate, endDate },
    }),
  create: (userId, data) =>
    api.post("/transactions", data, {
      headers: { "X-User-Id": userId },
    }),
  delete: (transactionId, userId) =>
    api.delete(`/transactions/${transactionId}`, {
      headers: { "X-User-Id": userId },
    }),
};

// 사용자 API
export const userAPI = {
  getUser: (userId) => api.get("/users/me", {
    headers: { "X-User-Id": userId },
  }),
  updateUser: (userId, data) => api.put("/users/me", data, {
    headers: { "X-User-Id": userId },
  }),
  changePassword: (userId, data) => api.put("/users/me/password", data, {
    headers: { "X-User-Id": userId },
  }),
};

export default api;
