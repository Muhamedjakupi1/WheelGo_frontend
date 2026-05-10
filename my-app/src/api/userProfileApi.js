import http from "./http";

export const getMyProfile = () => http.get("/api/user-profile/me");
export const updateMyProfile = (data) => http.put("/api/user-profile/me", data);
