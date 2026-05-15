import http from "./http";

export const getAddons = () => http.get("/api/v1/addons");
