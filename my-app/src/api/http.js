import axios from "axios";
import { clearAuth, getTenantSlugBeforeLogout, getToken } from "../utils/auth";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

const AUTH_NOTICE_KEY = "wheelgo_auth_notice";
const SESSION_EXPIRY_MESSAGES = new Set([
  "Invalid or expired token",
  "Authenticated user no longer exists",
  "Authenticated account is inactive",
  "Token no longer matches the current account state",
  "Your session expired after an account security change. Please log in again.",
]);

const redirectToLoginAfterSessionExpiry = () => {
  const tenantSlug = getTenantSlugBeforeLogout();
  clearAuth();
  sessionStorage.setItem(
    AUTH_NOTICE_KEY,
    "Your session expired after an account security change. Please log in again."
  );
  window.location.href = tenantSlug ? `/login/${tenantSlug}` : "/login";
};

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
  (err) => {
    if (err?.response?.status === 401) {
      const requestUrl = err.config?.url || "";
      const isAuthRequest =
        requestUrl.includes("/api/auth/login") ||
        requestUrl.includes("/api/auth/signup");
      const responseMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        (typeof err.response?.data === "string" ? err.response.data : "");
      const shouldForceLogout = SESSION_EXPIRY_MESSAGES.has(responseMessage);

      if (!isAuthRequest && shouldForceLogout) {
        redirectToLoginAfterSessionExpiry();
      }
    }

    return Promise.reject(err);
  }
);

export default http;
