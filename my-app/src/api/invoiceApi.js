import http from "./http";

export const downloadInvoicePdf = (bookingId) =>
  http.get(`/api/v1/invoices/booking/${bookingId}/pdf`, { responseType: "blob" });
