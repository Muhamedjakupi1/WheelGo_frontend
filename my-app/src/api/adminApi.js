import http from "./http";

export const getAdminVehicles = () => http.get("/api/v1/admin/vehicles");
export const createAdminVehicle = (data) => http.post("/api/v1/admin/vehicles", data);
export const updateAdminVehicle = (id, data) => http.patch(`/api/v1/admin/vehicles/${id}`, data);
export const deleteAdminVehicle = (id) => http.delete(`/api/v1/admin/vehicles/${id}`);

export const getAdminVehicleCategories = () => http.get("/api/v1/admin/vehicle-categories");
export const getAdminLocations = () => http.get("/api/v1/admin/locations");
export const createAdminLocation = (data) => http.post("/api/v1/admin/locations", data);
export const updateAdminLocation = (id, data) => http.patch(`/api/v1/admin/locations/${id}`, data);
export const deleteAdminLocation = (id) => http.delete(`/api/v1/admin/locations/${id}`);
export const createAdminVehicleCategory = (data) => http.post("/api/v1/admin/vehicle-categories", data);
export const updateAdminVehicleCategory = (id, data) => http.patch(`/api/v1/admin/vehicle-categories/${id}`, data);
export const deleteAdminVehicleCategory = (id) => http.delete(`/api/v1/admin/vehicle-categories/${id}`);

export const getAdminVehicleImages = (vehicleId) =>
  http.get("/api/v1/admin/vehicle-images", { params: vehicleId ? { vehicleId } : {} });
/** Multipart FormData with vehicleId, file, optional isPrimary (string "true"|"false") */
export const uploadAdminVehicleImage = (formData) =>
  http.post("/api/v1/admin/vehicle-images/upload", formData);
/** Multipart FormData — optional file, optional isPrimary (append at least one) */
export const updateAdminVehicleImage = (id, formData) =>
  http.patch(`/api/v1/admin/vehicle-images/${id}`, formData);
export const deleteAdminVehicleImage = (id) => http.delete(`/api/v1/admin/vehicle-images/${id}`);

export const getAdminUsers = () => http.get("/api/v1/admin/users");
export const updateAdminUser = (id, data) => http.patch(`/api/v1/admin/users/${id}`, data);
export const deleteAdminUser = (id) => http.delete(`/api/v1/admin/users/${id}`);
export const getAdminTenantSettings = () => http.get("/api/v1/admin/tenant-settings");

export const getAdminBookings = () => http.get("/api/v1/admin/bookings");
export const updateAdminBooking = (id, data) => http.patch(`/api/v1/admin/bookings/${id}`, data);
export const deleteAdminBooking = (id) => http.delete(`/api/v1/admin/bookings/${id}`);
export const confirmAdminBooking = (id, data) => http.patch(`/api/v1/admin/bookings/${id}/confirm`, data);
export const rejectAdminBooking = (id, data = {}) => http.patch(`/api/v1/admin/bookings/${id}/reject`, data);

export const getAdminAddons = () => http.get("/api/v1/admin/addons");
export const createAdminAddon = (data) => http.post("/api/v1/admin/addons", data);
export const ensureAdminDefaultAddons = () => http.post("/api/v1/admin/addons/ensure-defaults");
export const updateAdminAddon = (id, data) => http.patch(`/api/v1/admin/addons/${id}`, data);
export const deleteAdminAddon = (id) => http.delete(`/api/v1/admin/addons/${id}`);

