import { useCallback, useEffect, useMemo, useState } from "react";
import { Headphones, RefreshCw, Send } from "lucide-react";
import {
  addAdminSupportTicketMessage,
  getAdminSupportTicketMessages,
  getAdminSupportTickets,
  updateAdminSupportTicket,
} from "../../api/supportApi";
import { badge, button, card, emptyState, form, layout, palette } from "./adminStyles";

const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"];

export default function TenantAdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [savingTicket, setSavingTicket] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [selectedTicketId, tickets]
  );
  const selectedTicketClosed = selectedTicket?.status === "CLOSED";

  const loadTickets = useCallback(async () => {
    try {
      setLoadingTickets(true);
      setError("");
      const response = await getAdminSupportTickets();
      const nextTickets = Array.isArray(response.data) ? response.data : [];
      setTickets(nextTickets);
      setSelectedTicketId((current) => current || nextTickets[0]?.id || null);
    } catch (err) {
      setError(readError(err, "Failed to load support requests."));
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  const loadMessages = useCallback(async (ticketId) => {
    if (!ticketId) {
      setMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);
      setError("");
      const response = await getAdminSupportTicketMessages(ticketId);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(readError(err, "Failed to load messages."));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    loadMessages(selectedTicketId);
  }, [loadMessages, selectedTicketId]);

  const handleUpdateTicket = async (changes) => {
    if (!selectedTicket || savingTicket) return;

    try {
      setSavingTicket(true);
      setError("");
      const response = await updateAdminSupportTicket(selectedTicket.id, changes);
      setTickets((current) =>
        current.map((ticket) => (ticket.id === selectedTicket.id ? { ...ticket, ...response.data } : ticket))
      );
    } catch (err) {
      setError(readError(err, "Failed to update support request."));
    } finally {
      setSavingTicket(false);
    }
  };

  const handleSendReply = async (event) => {
    event.preventDefault();
    if (!selectedTicket || sending) return;

    try {
      setSending(true);
      setError("");
      await addAdminSupportTicketMessage(selectedTicket.id, { message: reply });
      setReply("");
      await Promise.all([loadMessages(selectedTicket.id), loadTickets()]);
    } catch (err) {
      setError(readError(err, "Failed to send reply."));
    } finally {
      setSending(false);
    }
  };

  const openCount = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const activeCount = tickets.filter((ticket) => ticket.status === "OPEN" || ticket.status === "IN_PROGRESS").length;
  const urgentCount = tickets.filter((ticket) => ticket.priority === "URGENT").length;

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Support</h1>
            <p style={card.subtitle}>Assist customers and respond to their support requests.</p>
          </div>
          <button type="button" onClick={loadTickets} style={{ ...button.secondary, display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "18px" }}>
        <Metric label="Total requests" value={tickets.length} />
        <Metric label="Open" value={openCount} />
        <Metric label="Active" value={activeCount} />
        <Metric label="Urgent" value={urgentCount} />
      </section>

      {error ? <div style={{ ...badge("danger"), justifyContent: "center" }}>{error}</div> : null}

      <section style={supportGrid}>
        <aside style={card.panel}>
          <div style={sectionHeader}>
            <h2 style={card.title}>Requests</h2>
            <Headphones size={18} color={palette.primary} />
          </div>

          {loadingTickets ? (
            <div style={emptyState}>Loading requests...</div>
          ) : tickets.length === 0 ? (
            <div style={emptyState}>No support requests yet.</div>
          ) : (
            <div style={ticketList}>
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  style={{
                    ...ticketButton,
                    ...(selectedTicketId === ticket.id ? ticketButtonActive : {}),
                  }}
                >
                  <span style={ticketTop}>
                    <strong>{ticket.subject}</strong>
                    <span style={badge(ticketTone(ticket.status))}>{formatStatus(ticket.status)}</span>
                  </span>
                  <span style={ticketMeta}>{ticket.customerEmail || "Customer"}</span>
                  <span style={priorityBadge(ticket.priority)}>{ticket.priority}</span>
                  <span style={ticketPreview}>{ticket.lastMessage || "No messages yet"}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section style={card.panel}>
          <div style={sectionHeader}>
            <div>
              <h2 style={card.title}>{selectedTicket?.subject || "Conversation"}</h2>
              <p style={card.subtitle}>{selectedTicket?.customerEmail || "Select a request to assist a customer"}</p>
            </div>
          </div>

          {selectedTicket ? (
            <div style={controls}>
              <label style={compactField}>
                Status
                <select
                  value={selectedTicket.status}
                  onChange={(event) => handleUpdateTicket({ status: event.target.value })}
                  disabled={savingTicket}
                  style={form.input}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{formatStatus(status)}</option>
                  ))}
                </select>
              </label>

              <label style={compactField}>
                Priority
                <select
                  value={selectedTicket.priority}
                  onChange={(event) => handleUpdateTicket({ priority: event.target.value })}
                  disabled={savingTicket}
                  style={form.input}
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {selectedTicketClosed ? (
            <div style={closedNotice}>This request is closed. Change the status to reopen it before replying.</div>
          ) : null}

          <div style={messageBox}>
            {loadingMessages ? (
              <div style={emptyState}>Loading messages...</div>
            ) : !selectedTicket ? (
              <div style={emptyState}>Choose a request to view messages.</div>
            ) : messages.length === 0 ? (
              <div style={emptyState}>No messages yet.</div>
            ) : (
              messages.map((message) => {
                const staffMessageBubble = isStaffMessage(message);
                return (
                  <div key={message.id} style={staffMessageBubble ? staffMessage : customerMessage}>
                    <div style={messageAuthor}>{staffMessageBubble ? "Admin" : "Customer"}</div>
                    <div style={messageText}>{message.message}</div>
                    <div style={messageTime}>{formatDate(message.sentAt)}</div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendReply} style={replyForm}>
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder={selectedTicketClosed ? "Reopen this request before replying." : "Write a reply to the customer..."}
              style={form.textarea}
              disabled={!selectedTicket || selectedTicketClosed}
            />
            <button
              type="submit"
              disabled={!selectedTicket || selectedTicketClosed || sending || !reply.trim()}
              style={{ ...button.primary, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <Send size={16} />
              {sending ? "Sending..." : "Send reply"}
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}

const Metric = ({ label, value }) => (
  <article style={{ ...card.panel, boxShadow: "none", borderRadius: "16px" }}>
    <div style={{ color: palette.muted, fontSize: "0.84rem", marginBottom: "8px" }}>{label}</div>
    <div style={{ color: palette.text, fontSize: "1.35rem", fontWeight: 800 }}>{value}</div>
  </article>
);

function readError(err, fallback) {
  return err?.response?.data?.message || err?.response?.data?.error || fallback;
}

function formatStatus(status) {
  return String(status || "-").replaceAll("_", " ");
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isStaffMessage(message) {
  return Boolean(message?.isStaff ?? message?.staff);
}

function ticketTone(status) {
  if (status === "RESOLVED" || status === "CLOSED") return "success";
  if (status === "OPEN") return "warning";
  return "default";
}

const priorityPalette = {
  LOW: { color: "#7dd3fc", background: "rgba(125,211,252,0.1)", border: "rgba(125,211,252,0.25)" },
  NORMAL: { color: "#38bdf8", background: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.25)" },
  HIGH: { color: "#fbbf24", background: "rgba(251,191,36,0.13)", border: "rgba(251,191,36,0.28)" },
  URGENT: { color: "#f87171", background: "rgba(248,113,113,0.14)", border: "rgba(248,113,113,0.34)" },
};

const priorityBadge = (priority) => {
  const tone = priorityPalette[priority] || priorityPalette.NORMAL;
  return {
    display: "inline-flex",
    width: "fit-content",
    marginTop: "7px",
    borderRadius: "999px",
    padding: "5px 9px",
    color: tone.color,
    background: tone.background,
    border: `1px solid ${tone.border}`,
    fontSize: "0.78rem",
    fontWeight: 800,
  };
};

const supportGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
  gap: "24px",
  alignItems: "start",
};
const sectionHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "16px" };
const ticketList = { display: "grid", gap: "10px" };
const ticketButton = { width: "100%", textAlign: "left", border: `1px solid ${palette.border}`, background: "#09101c", color: palette.text, borderRadius: "14px", padding: "14px", cursor: "pointer" };
const ticketButtonActive = { borderColor: "rgba(56,189,248,0.55)", background: "rgba(56,189,248,0.1)" };
const ticketTop = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" };
const ticketMeta = { display: "block", color: palette.muted, fontSize: "0.8rem", marginTop: "7px" };
const ticketPreview = { display: "block", color: "#cbd5e1", fontSize: "0.86rem", marginTop: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const controls = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "16px" };
const compactField = { ...form.field, color: palette.muted, fontSize: "0.86rem", fontWeight: 700 };
const closedNotice = { marginBottom: "14px", background: "rgba(251,191,36,0.12)", color: "#fde68a", border: "1px solid rgba(251,191,36,0.28)", borderRadius: "12px", padding: "11px 13px", fontSize: "0.86rem", lineHeight: 1.4 };
const messageBox = { minHeight: "380px", maxHeight: "540px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" };
const customerMessage = { alignSelf: "flex-start", maxWidth: "78%", background: "#18243a", border: `1px solid ${palette.border}`, color: palette.text, borderRadius: "16px 16px 16px 4px", padding: "12px 14px" };
const staffMessage = { alignSelf: "flex-end", maxWidth: "78%", background: "linear-gradient(135deg, #38bdf8, #2563eb)", color: "#fff", borderRadius: "16px 16px 4px 16px", padding: "12px 14px" };
const messageAuthor = { fontSize: "0.78rem", fontWeight: 800, marginBottom: "5px" };
const messageText = { lineHeight: 1.5, whiteSpace: "pre-wrap" };
const messageTime = { marginTop: "7px", fontSize: "0.72rem", opacity: 0.75 };
const replyForm = { display: "grid", gap: "10px", marginTop: "16px" };
