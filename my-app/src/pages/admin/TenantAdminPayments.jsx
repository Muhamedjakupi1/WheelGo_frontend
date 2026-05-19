import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, CreditCard, RefreshCw, RotateCcw } from "lucide-react";
import { getAdminBookings } from "../../api/adminApi";
import { confirmCashPayment, getAdminPayments, refundPayment } from "../../api/paymentApi";
import { useTenantSettings } from "../../context/TenantSettingsContext";
import { formatCurrencyAmount } from "../../utils/currency";
import { badge, button, card, emptyState, layout, palette, table } from "./adminStyles";

export default function TenantAdminPayments() {
  const { settings: tenantSettings } = useTenantSettings();
  const [payments, setPayments] = useState([]);
  const [bookingsById, setBookingsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [refundingId, setRefundingId] = useState(null);
  const [error, setError] = useState("");

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const [paymentResponse, bookingResponse] = await Promise.all([getAdminPayments(), getAdminBookings()]);
      setPayments(Array.isArray(paymentResponse.data) ? paymentResponse.data : []);
      setBookingsById(
        Object.fromEntries((Array.isArray(bookingResponse.data) ? bookingResponse.data : []).map((booking) => [booking.id, booking]))
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleConfirmCashPayment = async (paymentId) => {
    if (!paymentId || confirmingId) return;

    try {
      setConfirmingId(paymentId);
      setError("");
      const response = await confirmCashPayment(paymentId);
      setPayments((current) =>
        current.map((payment) => (payment.id === paymentId ? { ...payment, ...response.data } : payment))
      );
      await loadPayments();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to confirm cash payment.");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleRefundPayment = async (paymentId) => {
    if (!paymentId || refundingId) return;

    try {
      setRefundingId(paymentId);
      setError("");
      const response = await refundPayment(paymentId);
      setPayments((current) =>
        current.map((payment) => (payment.id === paymentId ? { ...payment, ...response.data } : payment))
      );
      await loadPayments();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to refund payment.");
    } finally {
      setRefundingId(null);
    }
  };

  const paidCount = payments.filter((payment) => payment.status === "PAID").length;
  const refundedCount = payments.filter((payment) => payment.status === "REFUNDED").length;
  const totalPaid = payments
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Payments</h1>
            <p style={card.subtitle}>Review customer payments, booking links, and generated invoices.</p>
          </div>
          <button type="button" onClick={loadPayments} style={{ ...button.secondary, display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "18px" }}>
        <Metric label="Total records" value={payments.length} />
        <Metric label="Paid" value={paidCount} />
        <Metric label="Refunded" value={refundedCount} />
        <Metric label="Revenue" value={formatCurrencyAmount(totalPaid, tenantSettings)} />
      </section>

      {error ? <div style={{ ...badge("danger"), justifyContent: "center" }}>{error}</div> : null}

      <section style={card.panel}>
        {loading ? (
          <div style={emptyState}>Loading payments...</div>
        ) : payments.length === 0 ? (
          <div style={emptyState}>No payments found.</div>
        ) : (
          <div style={table.wrapper}>
            <table style={table.table}>
              <thead>
                <tr>
                  <th style={table.headCell}>Customer</th>
                  <th style={table.headCell}>Vehicle</th>
                  <th style={table.headCell}>Dates</th>
                  <th style={table.headCell}>Amount</th>
                  <th style={table.headCell}>Status</th>
                  <th style={table.headCell}>Method</th>
                  <th style={table.headCell}>Invoice</th>
                  <th style={table.headCell}>Paid at</th>
                  <th style={table.headCell}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const booking = bookingsById[payment.bookingId];
                  const isCancelledBooking = booking?.status === "CANCELLED";
                  const isRefundableBooking = booking?.status === "CANCELLED" || booking?.status === "COMPLETED";
                  const canConfirm = payment.method === "CASH" && payment.status === "PENDING" && !isCancelledBooking;
                  const canRefund = payment.status === "PAID" && isRefundableBooking;
                  return (
                    <tr key={payment.id}>
                      <td style={table.cell}>
                        <div style={{ fontWeight: 700 }}>{booking?.customerEmail || "Customer"}</div>
                        <div style={{ color: palette.muted, fontSize: "0.82rem", marginTop: "4px" }}>{shortId(payment.bookingId)}</div>
                      </td>
                      <td style={table.cell}>{booking?.vehicleName || "Booked vehicle"}</td>
                      <td style={table.cell}>{formatDateRange(booking?.startDate, booking?.endDate)}</td>
                      <td style={table.cell}>{formatCurrencyAmount(payment.amount, tenantSettings)}</td>
                      <td style={table.cell}>
                        <span style={badge(paymentBadgeTone(payment, booking))}>{formatPaymentStatus(payment, booking)}</span>
                      </td>
                      <td style={table.cell}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
                          {payment.method === "CASH" ? <Banknote size={15} /> : <CreditCard size={15} />}
                          {payment.method}
                        </span>
                      </td>
                      <td style={table.cell}>{payment.invoiceNumber || "-"}</td>
                      <td style={table.cell}>{formatDate(payment.paidAt)}</td>
                      <td style={table.cell}>
                        {canConfirm ? (
                          <button
                            type="button"
                            onClick={() => handleConfirmCashPayment(payment.id)}
                            disabled={confirmingId === payment.id}
                            style={{
                              ...button.primary,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              opacity: confirmingId === payment.id ? 0.65 : 1,
                              cursor: confirmingId === payment.id ? "not-allowed" : "pointer",
                            }}
                          >
                            <CheckCircle2 size={15} />
                            {confirmingId === payment.id ? "Confirming..." : "Confirm cash"}
                          </button>
                        ) : canRefund ? (
                          <button
                            type="button"
                            onClick={() => handleRefundPayment(payment.id)}
                            disabled={refundingId === payment.id}
                            style={{
                              ...button.danger,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              opacity: refundingId === payment.id ? 0.65 : 1,
                              cursor: refundingId === payment.id ? "not-allowed" : "pointer",
                            }}
                          >
                            <RotateCcw size={15} />
                            {refundingId === payment.id ? "Refunding..." : "Refund"}
                          </button>
                        ) : payment.status === "PAID" ? (
                          <span style={{ color: palette.muted }}>Cancel booking first</span>
                        ) : isCancelledBooking && payment.method === "CASH" ? (
                          <span style={{ color: palette.muted }}>Cancelled</span>
                        ) : (
                          <span style={{ color: palette.muted }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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

function formatPaymentStatus(payment, booking) {
  if (payment?.status === "REFUNDED") {
    return "REFUNDED";
  }
  if (booking?.status === "CANCELLED" && payment?.status !== "PAID") {
    return "CANCELLED";
  }
  return payment?.status || "-";
}

function paymentBadgeTone(payment, booking) {
  if (payment?.status === "PAID") {
    return "success";
  }
  if (payment?.status === "REFUNDED") {
    return "default";
  }
  if (booking?.status === "CANCELLED" || payment?.status === "FAILED") {
    return "danger";
  }
  return "warning";
}

function shortId(value) {
  return value ? `Booking ${value.slice(0, 8)}` : "-";
}
