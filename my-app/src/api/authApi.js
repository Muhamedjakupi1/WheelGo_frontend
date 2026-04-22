import axios from "axios";

const pub = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

export const login = (tenantSlug, email, password) =>
  pub.post(`/api/auth/login/${tenantSlug}`, { email, password });

export const signupTenant = (tenantSlug, email, password) =>
  pub.post(`/api/auth/signup/${tenantSlug}`, { email, password });

export const checkTenant = (tenantSlug) =>
  pub.get(`/api/public/tenants/${tenantSlug}`);