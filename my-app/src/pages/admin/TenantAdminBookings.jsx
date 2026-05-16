import { useEffect, useMemo, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import {
  confirmAdminBooking,
  getAdminBookings,
  rejectAdminBooking,
} from "../../api/adminApi";
import { badge, button, card, emptyState, form, grid, layout, palette, table } from "./adminStyles";

const initialDecision = {
  addonName: "",
  addonCharge: "",
  note: "",
};

const formatPrice = (value) => Number(value || 0).toFixed(2);

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusTone = (status) => {
  if (status === "CONFIRMED" || status === "ACTIVE" || status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "danger";
  return "warning";
};

export default function TenantAdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [decision, setDecision] = useState(initialDecision);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedId) || bookings.find((booking) => booking.status === "PENDING") || bookings[0],
    [bookings, selectedId]
  );

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminBookings();
      setBookings(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (selectedBooking && selectedBooking.id !== selectedId) {
      setSelectedId(selectedBooking.id);
    }
  }, [selectedBooking, selectedId]);

  const selectBooking = (booking) => {
    setSelectedId(booking.id);
    setDecision(initialDecision);
    setMessage("");
    setError("");
  };

  const buildDecisionPayload = () => ({
    addonName: decision.addonName.trim() || null,
    addonCharge: decision.addonCharge === "" ? 0 : Number(decision.addonCharge),
    note: decision.note.trim() || null,
  });

  const handleConfirm = async () => {
    if (!selectedBooking) return;
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await confirmAdminBooking(selectedBooking.id, buildDecisionPayload());
      await loadBookings();
      setDecision(initialDecision);
      setMessage("Booking confirmed.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to confirm booking.");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking) return;
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await rejectAdminBooking(selectedBooking.id, { note: decision.note.trim() || null });
      await loadBookings();
      setDecision(initialDecision);
      setMessage("Booking rejected.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject booking.");
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = bookings.filter((booking) => booking.status === "PENDING").length;
  const canDecide = selectedBooking?.status === "PENDING";

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Bookings</h1>
            <p style={card.subtitle}>Review pending requests, approve custom charges, or reject bookings.</p>
          </div>
          <button type="button" onClick={loadBookings} style={{ ...button.secondary, display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      <section style={grid.two}>
        <article style={card.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 style={card.title}>Booking Queue</h2>
              <p style={card.subtitle}>{pendingCount} pending approvals</p>
            </div>
            <div style={badge("default")}>{loading ? "Loading" : `${bookings.length} records`}</div>
          </div>

          {loading ? (
            <div style={emptyState}>Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div style={emptyState}>No bookings found.</div>
          ) : (
            <div style={table.wrapper}>
              <table style={table.table}>
                <thead>
                  <tr>
                    <th style={table.headCell}>Customer</th>
                    <th style={table.headCell}>Vehicle</th>
                    <th style={table.headCell}>Dates</th>
                    <th style={table.headCell}>Total</th>
                    <th style={table.headCell}>Status</th>
                    <th style={table.headCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td style={table.cell}>
                        <div style={{ fontWeight: 700 }}>{booking.customerEmail || "Customer"}</div>
                        <div style={{ color: palette.muted, fontSize: "0.84rem", marginTop: "4px" }}>
                          {booking.locationName || "No location"}
                        </div>
                      </td>
                      <td style={table.cell}>{booking.vehicleName || "Booked vehicle"}</td>
                      <td style={table.cell}>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</td>
                      <td style={table.cell}>€{formatPrice(booking.totalPrice)}</td>
                      <td style={table.cell}>
                        <span style={badge(statusTone(booking.status))}>{booking.status}</span>
                      </td>
                      <td style={table.cell}>
                        <button type="button" style={button.ghost} onClick={() => selectBooking(booking)}>
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article style={card.panel}>
          <h2 style={card.title}>Decision</h2>
          <p style={card.subtitle}>
            {selectedBooking ? `${selectedBooking.vehicleName || "Booking"} for ${selectedBooking.customerEmail || "customer"}` : "Select a booking to review."}
          </p>

          {error && <div style={{ ...badge("danger"), marginTop: "16px", justifyContent: "center" }}>{error}</div>}
          {message && <div style={{ ...badge("success"), marginTop: "16px", justifyContent: "center" }}>{message}</div>}

          {selectedBooking ? (
            <div style={{ ...form.stack, marginTop: "18px" }}>
              <div style={{ ...card.panel, boxShadow: "none", borderRadius: "14px", padding: "16px" }}>
                <div style={{ display: "grid", gap: "10px", color: palette.muted, fontSize: "0.92rem" }}>
                  <span>Base: €{formatPrice(selectedBooking.basePrice)}</span>
                  <span>Add-ons: €{formatPrice(selectedBooking.addonPrice)}</span>
                  <span>Total: €{formatPrice(selectedBooking.totalPrice)}</span>
                  <span>Included: {(selectedBooking.addonNames || []).join(", ") || "None"}</span>
                </div>
                {selectedBooking.specialRequest && (
                  <p style={{ margin: "14px 0 0", color: palette.text, lineHeight: 1.6 }}>{selectedBooking.specialRequest}</p>
                )}
              </div>

              <div style={form.field}>
                <label style={form.label}>Approved addon name</label>
                <input
                  style={form.input}
                  value={decision.addonName}
                  onChange={(event) => setDecision({ ...decision, addonName: event.target.value })}
                  placeholder="Example: Airport pickup"
                  disabled={!canDecide || saving}
                />
              </div>

              <div style={form.field}>
                <label style={form.label}>Charge</label>
                <input
                  style={form.input}
                  type="number"
                  min="0"
                  step="0.01"
                  value={decision.addonCharge}
                  onChange={(event) => setDecision({ ...decision, addonCharge: event.target.value })}
                  placeholder="0.00"
                  disabled={!canDecide || saving}
                />
              </div>

              <div style={form.field}>
                <label style={form.label}>Admin note</label>
                <textarea
                  style={form.textarea}
                  value={decision.note}
                  onChange={(event) => setDecision({ ...decision, note: event.target.value })}
                  disabled={!canDecide || saving}
                />
              </div>

              <div style={form.actions}>
                <button
                  type="button"
                  style={{ ...button.primary, display: "inline-flex", alignItems: "center", gap: "8px" }}
                  onClick={handleConfirm}
                  disabled={!canDecide || saving}
                >
                  <Check size={16} />
                  Confirm
                </button>
                <button
                  type="button"
                  style={{ ...button.danger, display: "inline-flex", alignItems: "center", gap: "8px" }}
                  onClick={handleReject}
                  disabled={!canDecide || saving}
                >
                  <X size={16} />
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div style={{ ...emptyState, marginTop: "18px" }}>No booking selected.</div>
          )}
        </article>
      </section>
    </div>
  );
}
