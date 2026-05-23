import http from "./http";

export const createReview = (data) => http.post("/api/v1/reviews", data);
export const getMyReviews = () => http.get("/api/v1/reviews/me");
export const getVehicleReviews = (vehicleId) => http.get(`/api/v1/reviews/vehicles/${vehicleId}`);
