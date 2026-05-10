import http from "./http";

export const getVehicles = () => http.get("/api/v1/vehicles");
