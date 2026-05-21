import http from "./http";

export const getMySupportTickets = () => http.get("/api/v1/support/tickets/me");
export const createSupportTicket = (data) => http.post("/api/v1/support/tickets", data);
export const getMySupportTicketMessages = (ticketId) =>
  http.get(`/api/v1/support/tickets/${ticketId}/messages`);
export const addMySupportTicketMessage = (ticketId, data) =>
  http.post(`/api/v1/support/tickets/${ticketId}/messages`, data);

export const getAdminSupportTickets = () => http.get("/api/v1/admin/support/tickets");
export const updateAdminSupportTicket = (ticketId, data) =>
  http.patch(`/api/v1/admin/support/tickets/${ticketId}`, data);
export const getAdminSupportTicketMessages = (ticketId) =>
  http.get(`/api/v1/admin/support/tickets/${ticketId}/messages`);
export const addAdminSupportTicketMessage = (ticketId, data) =>
  http.post(`/api/v1/admin/support/tickets/${ticketId}/messages`, data);
