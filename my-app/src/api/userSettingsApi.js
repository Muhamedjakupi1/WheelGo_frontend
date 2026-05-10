import http from "./http";

export const updateMySettingsPassword = (data) =>
  http.put("/api/user-settings/me/password", data);
