import http from "./http";

export const payForBooking = (data) => http.post("/api/v1/payments/pay", data);
export const getMyPayments = () => http.get("/api/v1/payments/me");
export const getPaymentForBooking = (bookingId) => http.get(`/api/v1/payments/booking/${bookingId}`);
export const getAdminPayments = () => http.get("/api/v1/admin/payments");
export const confirmCashPayment = (paymentId) => http.patch(`/api/v1/admin/payments/${paymentId}/confirm`);
export const refundPayment = (paymentId) => http.patch(`/api/v1/admin/payments/${paymentId}/refund`);
