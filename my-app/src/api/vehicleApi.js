import http from "./http";

export const getVehicles = (keyword = "") =>
  http.get("/api/v1/vehicles", { params: keyword ? { keyword } : {} });
