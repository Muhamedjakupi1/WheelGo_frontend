import { useCallback, useEffect, useMemo, useState } from "react";
import { LifeBuoy, MessageCircle, Plus, RefreshCw, Send } from "lucide-react";
import {
  addMySupportTicketMessage,
  createSupportTicket,
  getMySupportTicketMessages,
  getMySupportTickets,
} from "../../api/supportApi";

const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"];

export default function TenantUserSupport() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ subject: "", priority: "NORMAL", message: "" });
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
      const response = await getMySupportTickets();
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
      const response = await getMySupportTicketMessages(ticketId);
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

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    if (creating) return;

    try {
      setCreating(true);
      setError("");
      const response = await createSupportTicket({
        subject: form.subject,
        priority: form.priority,
        message: form.message,
      });
      setForm({ subject: "", priority: "NORMAL", message: "" });
      await loadTickets();
      setSelectedTicketId(response.data?.id || null);
    } catch (err) {
      setError(readError(err, "Failed to create support request."));
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (event) => {
    event.preventDefault();
    if (!selectedTicketId || sending) return;

    try {
      setSending(true);
      setError("");
      await addMySupportTicketMessage(selectedTicketId, { message: reply });
      setReply("");
      await Promise.all([loadMessages(selectedTicketId), loadTickets()]);
    } catch (err) {
      setError(readError(err, "Failed to send message."));
    } finally {
      setSending(false);
    }
  };

  return (
    <main style={s.page}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Support</h1>
          <p style={s.subtitle}>Send a request and continue the conversation with the admin team.</p>
        </div>
        <button type="button" onClick={loadTickets} style={s.refreshBtn}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {error ? <div style={s.error}>{error}</div> : null}

      <section style={s.grid}>
        <aside style={s.panel}>
          <div style={s.panelHeader}>
            <h2 style={s.panelTitle}>My requests</h2>
            <LifeBuoy size={18} color="#38bdf8" />
          </div>

          {loadingTickets ? (
            <div style={s.empty}>Loading requests...</div>
          ) : tickets.length === 0 ? (
            <div style={s.empty}>No requests yet.</div>
          ) : (
            <div style={s.ticketList}>
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  style={{
                    ...s.ticketItem,
                    ...(selectedTicketId === ticket.id ? s.ticketItemActive : {}),
                  }}
                >
                  <span style={s.ticketTop}>
                    <strong>{ticket.subject}</strong>
                    <span style={badge(ticket.status)}>{formatStatus(ticket.status)}</span>
                  </span>
                  <span style={priorityBadge(ticket.priority)}>{ticket.priority} priority</span>
                  <span style={s.ticketPreview}>{ticket.lastMessage || "No messages yet"}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section style={s.panel}>
          <div style={s.panelHeader}>
            <div>
              <h2 style={s.panelTitle}>{selectedTicket?.subject || "Conversation"}</h2>
              <p style={s.panelSubtitle}>
                {selectedTicket ? `${formatStatus(selectedTicket.status)} - ${selectedTicket.priority}` : "Select a request"}
              </p>
            </div>
            <MessageCircle size={18} color="#38bdf8" />
          </div>

          {selectedTicketClosed ? (
            <div style={s.closedNotice}>This request is closed. The admin must reopen it before new messages can be sent.</div>
          ) : null}

          <div style={s.messageBox}>
            {loadingMessages ? (
              <div style={s.empty}>Loading messages...</div>
            ) : !selectedTicket ? (
              <div style={s.empty}>Choose a request to view messages.</div>
            ) : messages.length === 0 ? (
              <div style={s.empty}>No messages yet.</div>
            ) : (
              messages.map((message) => {
                const staffMessage = isStaffMessage(message);
                return (
                  <div key={message.id} style={staffMessage ? s.adminMessage : s.userMessage}>
                    <div style={s.messageAuthor}>{staffMessage ? "Admin" : "You"}</div>
                    <div style={s.messageText}>{message.message}</div>
                    <div style={s.messageTime}>{formatDate(message.sentAt)}</div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendReply} style={s.replyForm}>
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder={selectedTicketClosed ? "This request is closed." : "Write a reply..."}
              style={s.textarea}
              disabled={!selectedTicket || selectedTicketClosed}
            />
            <button type="submit" disabled={!selectedTicket || selectedTicketClosed || sending || !reply.trim()} style={s.primaryBtn}>
              <Send size={16} />
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </section>

        <section style={s.panel}>
          <div style={s.panelHeader}>
            <h2 style={s.panelTitle}>New request</h2>
            <Plus size={18} color="#38bdf8" />
          </div>

          <form onSubmit={handleCreateTicket} style={s.form}>
            <label style={s.label}>
              Subject
              <input
                value={form.subject}
                onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                placeholder="Booking change, payment issue..."
                style={s.input}
                maxLength={150}
                required
              />
            </label>

            <label style={s.label}>
              Priority
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                style={s.input}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </label>

            <label style={s.label}>
              Message
              <textarea
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Tell us what happened..."
                style={s.textarea}
                required
              />
            </label>

            <button type="submit" disabled={creating || !form.subject.trim() || !form.message.trim()} style={s.primaryBtn}>
              <Plus size={16} />
              {creating ? "Creating..." : "Create request"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

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
    fontSize: "12px",
    fontWeight: 800,
  };
};

const badge = (status) => ({
  borderRadius: "999px",
  padding: "5px 9px",
  fontSize: "11px",
  fontWeight: 800,
  color: status === "CLOSED" || status === "RESOLVED" ? "#34d399" : "#38bdf8",
  background: status === "CLOSED" || status === "RESOLVED" ? "rgba(52,211,153,0.12)" : "rgba(56,189,248,0.12)",
  border: status === "CLOSED" || status === "RESOLVED" ? "1px solid rgba(52,211,153,0.22)" : "1px solid rgba(56,189,248,0.22)",
});

const s = {
  page: { color: "#fff", display: "grid", gap: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" },
  title: { margin: 0, fontSize: "32px" },
  subtitle: { margin: "8px 0 0", color: "#94a3b8" },
  refreshBtn: { display: "inline-flex", alignItems: "center", gap: "8px", background: "transparent", color: "#fff", border: "1px solid #334155", borderRadius: "12px", padding: "11px 14px", cursor: "pointer", fontWeight: 700 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "20px", alignItems: "start" },
  panel: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: "18px", padding: "18px" },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "16px" },
  panelTitle: { margin: 0, fontSize: "18px" },
  panelSubtitle: { margin: "6px 0 0", color: "#94a3b8", fontSize: "13px" },
  ticketList: { display: "grid", gap: "10px" },
  ticketItem: { width: "100%", textAlign: "left", border: "1px solid #1e293b", background: "#111c2e", color: "#fff", borderRadius: "14px", padding: "14px", cursor: "pointer" },
  ticketItemActive: { borderColor: "rgba(56,189,248,0.5)", background: "rgba(56,189,248,0.1)" },
  ticketTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" },
  ticketMeta: { display: "block", color: "#94a3b8", fontSize: "12px", marginTop: "7px" },
  ticketPreview: { display: "block", color: "#cbd5e1", fontSize: "13px", marginTop: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  messageBox: { minHeight: "360px", maxHeight: "520px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" },
  userMessage: { alignSelf: "flex-end", maxWidth: "78%", background: "linear-gradient(135deg, #38bdf8, #2563eb)", color: "#fff", borderRadius: "16px 16px 4px 16px", padding: "12px 14px" },
  adminMessage: { alignSelf: "flex-start", maxWidth: "78%", background: "#18243a", border: "1px solid #26354f", color: "#e2e8f0", borderRadius: "16px 16px 16px 4px", padding: "12px 14px" },
  messageAuthor: { fontSize: "12px", fontWeight: 800, marginBottom: "5px" },
  messageText: { lineHeight: 1.5, whiteSpace: "pre-wrap" },
  messageTime: { marginTop: "7px", fontSize: "11px", opacity: 0.75 },
  replyForm: { display: "grid", gap: "10px", marginTop: "16px" },
  closedNotice: { marginBottom: "14px", background: "rgba(251,191,36,0.12)", color: "#fde68a", border: "1px solid rgba(251,191,36,0.28)", borderRadius: "12px", padding: "11px 13px", fontSize: "13px", lineHeight: 1.4 },
  form: { display: "grid", gap: "14px" },
  label: { display: "grid", gap: "8px", color: "#94a3b8", fontSize: "13px", fontWeight: 700 },
  input: { background: "#09111f", color: "#fff", border: "1px solid #334155", borderRadius: "12px", padding: "12px 13px", outline: "none" },
  textarea: { background: "#09111f", color: "#fff", border: "1px solid #334155", borderRadius: "12px", padding: "12px 13px", outline: "none", minHeight: "96px", resize: "vertical" },
  primaryBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: 0, background: "linear-gradient(135deg, #38bdf8, #2563eb)", color: "#fff", borderRadius: "12px", padding: "12px 15px", cursor: "pointer", fontWeight: 800 },
  empty: { minHeight: "140px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", border: "1px dashed #334155", borderRadius: "14px", padding: "16px", textAlign: "center" },
  error: { background: "rgba(127,29,29,0.25)", color: "#fecaca", border: "1px solid #7f1d1d", borderRadius: "14px", padding: "12px 14px" },
};
