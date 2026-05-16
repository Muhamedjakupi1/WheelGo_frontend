import http from "./http";

export const getCurrentTenantSettings = () => http.get("/api/v1/tenant-settings");
