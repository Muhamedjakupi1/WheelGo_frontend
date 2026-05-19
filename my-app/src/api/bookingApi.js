import http from "./http";

export const createBooking = (data) => http.post("/api/v1/bookings", data);
export const getMyBookings = (keyword = "") =>
  http.get("/api/v1/bookings/me", { params: keyword ? { keyword } : {} });
export const cancelMyBooking = (id) => http.patch(`/api/v1/bookings/${id}/cancel`);
