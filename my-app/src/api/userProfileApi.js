import http from "./http";

export const getMyProfile = () => http.get("/api/user-profile/me");
export const updateMyProfile = (data) => http.put("/api/user-profile/me", data);
export const uploadMyAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return http.post("/api/user-profile/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
