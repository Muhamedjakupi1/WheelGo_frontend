import axios from "axios";
import { getToken } from "../utils/auth";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

const getTenantSlugFromPath = () => {
  const match = window.location.pathname.match(/^\/t\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const tenantSlug = getTenantSlugFromPath();
  if (tenantSlug) {
    config.headers["X-Tenant-Slug"] = tenantSlug;
  }

  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default http;
