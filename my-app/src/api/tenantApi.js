import axios from "axios";

const API = axios.create({
  baseURL: "/api/admin",
});

export const getAllTenants  = ()       => API.get("/tenants");
export const createTenant  = (data)   => API.post("/tenants", data);
export const updateTenant  = (id, data) => API.patch(`/tenants/${id}`, data);
export const deleteTenant  = (id)     => API.delete(`/tenants/${id}`);