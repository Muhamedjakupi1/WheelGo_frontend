import { useCallback, useEffect, useState } from "react";
import { CreditCard, RefreshCw, Search } from "lucide-react";
import { getMyBookings } from "../../api/bookingApi";
import { getMyPayments } from "../../api/paymentApi";
import { useTenantSettings } from "../../context/TenantSettingsContext";
import { formatCurrencyAmount } from "../../utils/currency";

export default function UserPayments() {
  const { settings: tenantSettings } = useTenantSettings();
  const [payments, setPayments] = useState([]);
  const [bookingsById, setBookingsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadPayments = useCallback(async (keyword = "") => {
    try {
      setLoading(true);
      setError("");
      const normalizedKeyword = keyword.trim();
      const [paymentResponse, bookingResponse] = await Promise.all([getMyPayments(normalizedKeyword), getMyBookings()]);
      setPayments(Array.isArray(paymentResponse.data) ? paymentResponse.data : []);
      setBookingsById(
        Object.fromEntries((Array.isArray(bookingResponse.data) ? bookingResponse.data : []).map((booking) => [booking.id, booking]))
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadPayments(searchTerm);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [loadPayments, searchTerm]);

  return (
    <main style={s.page}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Payments</h1>
          <p style={s.subtitle}>Track your paid bookings and invoice numbers.</p>
        </div>
        <button type="button" onClick={() => loadPayments(searchTerm)} style={s.refreshBtn}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {error ? <div style={s.error}>{error}</div> : null}

      <section style={s.toolbar}>
        <div style={s.searchWrap}>
          <Search size={17} color="#94a3b8" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search payments..."
            style={s.searchInput}
          />
        </div>
      </section>

      <section style={s.panel}>
        {loading ? (
          <div style={s.empty}>Loading payments...</div>
        ) : payments.length === 0 ? (
          <div style={s.empty}>No payments found.</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Booking</th>
                  <th style={s.th}>Dates</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>Method</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Invoice</th>
                  <th style={s.th}>Paid</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const booking = bookingsById[payment.bookingId];
                  return (
                    <tr key={payment.id}>
                      <td style={s.td}>
                        <div style={s.bookingCell}>
                          <CreditCard size={16} />
                          <span>{booking?.vehicleName || "Booking"}</span>
                        </div>
                      </td>
                      <td style={s.td}>{formatDateRange(booking?.startDate, booking?.endDate)}</td>
                      <td style={s.td}>{formatCurrencyAmount(payment.amount, tenantSettings)}</td>
                      <td style={s.td}>{payment.method}</td>
                      <td style={s.td}><span style={badge(payment.status)}>{payment.status}</span></td>
                      <td style={s.td}>{payment.invoiceNumber || "-"}</td>
                      <td style={s.td}>{formatDate(payment.paidAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "-";
  return `${formatCalendarDate(startDate)} - ${formatCalendarDate(endDate)}`;
}

function formatCalendarDate(value) {
  if (!value) return "-";
  return new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const badge = (status) => ({
  display: "inline-flex",
  borderRadius: "999px",
  padding: "6px 10px",
  color: status === "PAID" ? "#34d399" : "#fbbf24",
  background: status === "PAID" ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)",
  border: status === "PAID" ? "1px solid rgba(52,211,153,0.22)" : "1px solid rgba(251,191,36,0.22)",
  fontWeight: 800,
  fontSize: "12px",
});

const s = {
  page: { color: "#fff", display: "grid", gap: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" },
  title: { margin: 0, fontSize: "32px" },
  subtitle: { margin: "8px 0 0", color: "#94a3b8" },
  refreshBtn: { display: "inline-flex", alignItems: "center", gap: "8px", background: "transparent", color: "#fff", border: "1px solid #334155", borderRadius: "12px", padding: "11px 14px", cursor: "pointer", fontWeight: 700 },
  toolbar: { display: "flex", justifyContent: "flex-end" },
  searchWrap: { width: "min(100%, 420px)", display: "flex", alignItems: "center", gap: "10px", background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", padding: "0 12px" },
  searchInput: { width: "100%", minHeight: "42px", background: "transparent", border: 0, outline: "none", color: "#fff", fontSize: "14px" },
  panel: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: "18px", padding: "20px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "14px 12px", color: "#94a3b8", borderBottom: "1px solid #334155", fontSize: "12px", textTransform: "uppercase" },
  td: { padding: "16px 12px", borderBottom: "1px solid rgba(51,65,85,0.65)" },
  bookingCell: { display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 },
  empty: { minHeight: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", border: "1px dashed #334155", borderRadius: "16px" },
  error: { background: "rgba(127,29,29,0.25)", color: "#fecaca", border: "1px solid #7f1d1d", borderRadius: "14px", padding: "12px 14px" },
};
