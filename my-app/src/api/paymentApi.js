import http from "./http";

export const payForBooking = (data) => http.post("/api/v1/payments/pay", data);
export const getMyPayments = (keyword = "") =>
  http.get("/api/v1/payments/me", { params: keyword ? { keyword } : {} });
export const getPaymentForBooking = (bookingId) => http.get(`/api/v1/payments/booking/${bookingId}`);
export const getAdminPayments = (keyword = "") =>
  http.get("/api/v1/admin/payments", { params: keyword ? { keyword } : {} });
export const confirmCashPayment = (paymentId) => http.patch(`/api/v1/admin/payments/${paymentId}/confirm`);
export const refundPayment = (paymentId) => http.patch(`/api/v1/admin/payments/${paymentId}/refund`);
export const updateAdminPaymentStatus = (paymentId, status) =>
  http.patch(`/api/v1/admin/payments/${paymentId}`, { status });
