import http from "./http";

export const getMyDriverLicense = () => http.get("/api/driver-license/me");
export const updateMyDriverLicense = (data) => http.put("/api/driver-license/me", data);

export const uploadMyDriverLicenseFront = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return http.post("/api/driver-license/me/front-image", formData);
};

export const uploadMyDriverLicenseBack = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return http.post("/api/driver-license/me/back-image", formData);
};

export const verifyMyDriverLicense = (data, files = {}) => {
  if (files.front || files.back) {
    const formData = new FormData();
    formData.append("licenseNumber", data.licenseNumber);
    formData.append("issuingCountry", data.issuingCountry);
    formData.append("expiryDate", data.expiryDate);
    if (files.front) formData.append("frontImage", files.front);
    if (files.back) formData.append("backImage", files.back);
    return http.post("/api/driver-license/me/verify", formData);
  }

  return http.post("/api/driver-license/me/verify", data);
};
