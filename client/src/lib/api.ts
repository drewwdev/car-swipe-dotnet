import axios from "axios";

const rawBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5277";

const base = rawBase.replace(/\/+$/, "");

const baseURL = `${base}/api`;

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
