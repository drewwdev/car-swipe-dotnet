import axios from "axios";

function ensureTrailing(path: string, segment: string) {
  const t = path.replace(/\/+$/, "");
  return t.endsWith(segment) ? t : `${t}${segment}`;
}

const envBase = import.meta.env.VITE_API_BASE_URL?.toString().trim();

const fallback = import.meta.env.DEV ? "/api" : `${window.location.origin}/api`;

let base = (envBase && envBase.length > 0 ? envBase : fallback).replace(
  /\/+$/,
  ""
);

if (/car-swipe-api\.onrender\.com$/.test(base)) {
  base = ensureTrailing(base, "/api");
}

try {
  const u = new URL(base);
  if (!u.pathname || u.pathname === "/") base = `${u.origin}/api`;
} catch {
  // If URL parsing fails, we assume the base is already correct
}

const api = axios.create({
  baseURL: base,
  timeout: 15000,
  headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
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
