import http from "./http";

export const getAllTenants = ()         => http.get("/api/super-admin/tenants");
export const createTenant = (data)     => http.post("/api/super-admin/tenants", data);
export const updateTenant = (id, data) => http.patch(`/api/super-admin/tenants/${id}`, data);
export const deleteTenant = (id)       => http.delete(`/api/super-admin/tenants/${id}`);
export const getSupportedTenantCurrencies = () => http.get("/api/super-admin/tenants/currencies");

export const startImpersonation = (tenantSlug) =>
  http.post(`/api/super-admin/impersonation/start/${tenantSlug}`);

export const stopImpersonation = () =>
  http.post("/api/super-admin/impersonation/stop");
