import http from "./http";

export const createBooking = (data) => http.post("/api/v1/bookings", data);
export const getMyBookings = () => http.get("/api/v1/bookings/me");
