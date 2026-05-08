import http from "./http";

export const getAdminVehicles = () => http.get("/api/v1/admin/vehicles");
export const createAdminVehicle = (data) => http.post("/api/v1/admin/vehicles", data);
export const updateAdminVehicle = (id, data) => http.patch(`/api/v1/admin/vehicles/${id}`, data);
export const deleteAdminVehicle = (id) => http.delete(`/api/v1/admin/vehicles/${id}`);

export const getAdminVehicleCategories = () => http.get("/api/v1/admin/vehicle-categories");
export const createAdminVehicleCategory = (data) => http.post("/api/v1/admin/vehicle-categories", data);
export const updateAdminVehicleCategory = (id, data) => http.patch(`/api/v1/admin/vehicle-categories/${id}`, data);
export const deleteAdminVehicleCategory = (id) => http.delete(`/api/v1/admin/vehicle-categories/${id}`);

export const getAdminVehicleImages = (vehicleId) =>
  http.get("/api/v1/admin/vehicle-images", { params: vehicleId ? { vehicleId } : {} });
export const createAdminVehicleImage = (data) => http.post("/api/v1/admin/vehicle-images", data);
export const uploadAdminVehicleImage = (formData) =>
  http.post("/api/v1/admin/vehicle-images/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateAdminVehicleImage = (id, data) => http.patch(`/api/v1/admin/vehicle-images/${id}`, data);
export const deleteAdminVehicleImage = (id) => http.delete(`/api/v1/admin/vehicle-images/${id}`);

export const getAdminUsers = () => http.get("/api/v1/admin/users");
export const updateAdminUser = (id, data) => http.patch(`/api/v1/admin/users/${id}`, data);

