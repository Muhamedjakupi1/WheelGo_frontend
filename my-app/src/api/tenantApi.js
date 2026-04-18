import http from "./http";

export const getAllTenants = ()         => http.get("/api/super-admin/tenants");
export const createTenant = (data)     => http.post("/api/super-admin/tenants", data);
export const updateTenant = (id, data) => http.patch(`/api/super-admin/tenants/${id}`, data);
export const deleteTenant = (id)       => http.delete(`/api/super-admin/tenants/${id}`);

export const startImpersonation = (tenantSlug, userId) =>
  http.post(`/api/super-admin/impersonation/start/${tenantSlug}/${userId}`);

export const stopImpersonation = () =>
  http.post("/api/super-admin/impersonation/stop");