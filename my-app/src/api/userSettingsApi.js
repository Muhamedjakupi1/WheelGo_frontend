import http from "./http";

export const getMySettings = () =>
  http.get("/api/user-settings/me");

export const updateMySettingsPassword = (data) =>
  http.put("/api/user-settings/me/password", data);
