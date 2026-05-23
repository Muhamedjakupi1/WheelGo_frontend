import http from "./http";

export const createAdminVehicle = (data) => http.post("/api/v1/admin/vehicles", data);
export const updateAdminVehicle = (id, data) => http.patch(`/api/v1/admin/vehicles/${id}`, data);
export const deleteAdminVehicle = (id) => http.delete(`/api/v1/admin/vehicles/${id}`);

export const getAdminVehicleCategories = (keyword = "") =>
  http.get("/api/v1/admin/vehicle-categories", { params: keyword ? { keyword } : {} });
export const getAdminLocations = (keyword = "") =>
  http.get("/api/v1/admin/locations", { params: keyword ? { keyword } : {} });
export const createAdminLocation = (data) => http.post("/api/v1/admin/locations", data);
export const updateAdminLocation = (id, data) => http.patch(`/api/v1/admin/locations/${id}`, data);
export const deleteAdminLocation = (id) => http.delete(`/api/v1/admin/locations/${id}`);
export const createAdminVehicleCategory = (data) => http.post("/api/v1/admin/vehicle-categories", data);
export const updateAdminVehicleCategory = (id, data) => http.patch(`/api/v1/admin/vehicle-categories/${id}`, data);
export const deleteAdminVehicleCategory = (id) => http.delete(`/api/v1/admin/vehicle-categories/${id}`);

export const getAdminVehicleImages = (vehicleId, keyword = "") =>
  http.get("/api/v1/admin/vehicle-images", {
    params: {
      ...(vehicleId ? { vehicleId } : {}),
      ...(keyword ? { keyword } : {}),
    },
  });
/** Multipart FormData with vehicleId, file, optional isPrimary (string "true"|"false") */
export const uploadAdminVehicleImage = (formData) =>
  http.post("/api/v1/admin/vehicle-images/upload", formData);
/** Multipart FormData — optional file, optional isPrimary (append at least one) */
export const updateAdminVehicleImage = (id, formData) =>
  http.patch(`/api/v1/admin/vehicle-images/${id}`, formData);
export const deleteAdminVehicleImage = (id) => http.delete(`/api/v1/admin/vehicle-images/${id}`);

export const getAdminUsers = (keyword = "") =>
  http.get("/api/v1/admin/users", { params: keyword ? { keyword } : {} });
export const updateAdminUser = (id, data) => http.patch(`/api/v1/admin/users/${id}`, data);
export const deleteAdminUser = (id) => http.delete(`/api/v1/admin/users/${id}`);
export const getAdminTenantSettings = () => http.get("/api/v1/admin/tenant-settings");

export const getAdminBookings = (keyword = "") =>
  http.get("/api/v1/admin/bookings", { params: keyword ? { keyword } : {} });
export const updateAdminBooking = (id, data) => http.patch(`/api/v1/admin/bookings/${id}`, data);
export const deleteAdminBooking = (id) => http.delete(`/api/v1/admin/bookings/${id}`);
export const confirmAdminBooking = (id, data) => http.patch(`/api/v1/admin/bookings/${id}/confirm`, data);
export const rejectAdminBooking = (id, data = {}) => http.patch(`/api/v1/admin/bookings/${id}/reject`, data);

export const getAdminAddons = () => http.get("/api/v1/admin/addons");
export const createAdminAddon = (data) => http.post("/api/v1/admin/addons", data);
export const ensureAdminDefaultAddons = () => http.post("/api/v1/admin/addons/ensure-defaults");
export const updateAdminAddon = (id, data) => http.patch(`/api/v1/admin/addons/${id}`, data);
export const deleteAdminAddon = (id) => http.delete(`/api/v1/admin/addons/${id}`);

export const getAdminPromotions = () => http.get("/api/v1/admin/promotions");
export const createAdminPromotion = (data) => http.post("/api/v1/admin/promotions", data);
export const updateAdminPromotion = (id, data) => http.patch(`/api/v1/admin/promotions/${id}`, data);
export const deleteAdminPromotion = (id) => http.delete(`/api/v1/admin/promotions/${id}`);

export const getAdminVehicles = (keyword = "") =>
  http.get("/api/v1/admin/vehicles", { params: keyword ? { keyword } : {} });

export const getAdminMaintenances = (keyword = "") =>
  http.get("/api/v1/admin/maintenances", { params: keyword ? { keyword } : {} });
export const getAdminMaintenanceTypes = () => http.get("/api/v1/admin/maintenances/types");
export const createAdminMaintenance = (data) => http.post("/api/v1/admin/maintenances", data);
export const updateAdminMaintenance = (id, data) => http.patch(`/api/v1/admin/maintenances/${id}`, data);
export const deleteAdminMaintenance = (id) => http.delete(`/api/v1/admin/maintenances/${id}`);

