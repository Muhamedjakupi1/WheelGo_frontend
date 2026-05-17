import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import {
  deleteAdminBooking,
  getAdminBookings,
  updateAdminBooking,
} from "../../api/adminApi";
import { useTenantSettings } from "../../context/TenantSettingsContext";
import { useIsCompactLayout } from "../../hooks/useIsCompactLayout";
import { formatCurrencyAmount } from "../../utils/currency";
import AdminConfirmModal from "./AdminConfirmModal";
import { badge, button, card, emptyState, form, layout, palette, table, getReadHeavyTwoColumnLayout } from "./adminStyles";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"];

const initialDecision = {
  startDate: "",
  endDate: "",
  status: "PENDING",
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

const toDateInputValue = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.includes("T")) {
    return value.split("T")[0];
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const statusTone = (status) => {
  if (status === "CONFIRMED" || status === "ACTIVE" || status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "danger";
  return "warning";
};

export default function TenantAdminBookings() {
  const { settings: tenantSettings } = useTenantSettings();
  const isCompact = useIsCompactLayout(1200);
  const isMedium = useIsCompactLayout(1500);
  const [bookings, setBookings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [decision, setDecision] = useState(initialDecision);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteState, setDeleteState] = useState({ open: false, id: null, label: "" });
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
      setBookings(Array.isArray(response.data) ? response.data : []);
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
    if (!selectedBooking) return;
    setSelectedId(selectedBooking.id);
    setDecision({
      startDate: toDateInputValue(selectedBooking.startDate),
      endDate: toDateInputValue(selectedBooking.endDate),
      status: selectedBooking.status || "PENDING",
      addonName: "",
      addonCharge: "",
      note: "",
    });
  }, [selectedBooking?.id]);

  const selectBooking = (booking) => {
    setSelectedId(booking.id);
    setMessage("");
    setError("");
  };

  const handleSave = async () => {
    if (!selectedBooking) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await updateAdminBooking(selectedBooking.id, {
        startDate: decision.startDate || null,
        endDate: decision.endDate || null,
        status: decision.status,
        addonName: decision.addonName.trim() || null,
        addonCharge: decision.addonCharge === "" ? null : Number(decision.addonCharge),
        note: decision.note.trim() || null,
      });

      await loadBookings();
      setDecision((current) => ({
        ...current,
        addonName: "",
        addonCharge: "",
        note: "",
      }));
      setMessage("Booking updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update booking.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (booking) => {
    setDeleteState({
      open: true,
      id: booking.id,
      label: booking.vehicleName || "this booking",
    });
    setMessage("");
    setError("");
  };

  const handleDelete = async () => {
    if (!deleteState.id) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");
      await deleteAdminBooking(deleteState.id);
      await loadBookings();
      if (selectedId === deleteState.id) {
        setSelectedId(null);
        setDecision(initialDecision);
      }
      setDeleteState({ open: false, id: null, label: "" });
      setMessage("Booking deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete booking.");
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = bookings.filter((booking) => booking.status === "PENDING").length;
  const bookingWorkspaceGrid = getReadHeavyTwoColumnLayout(isCompact, isMedium);

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Bookings</h1>
            <p style={card.subtitle}>Review requests, move booking dates, and set the status to any lifecycle state.</p>
          </div>
          <button type="button" onClick={loadBookings} style={{ ...button.secondary, display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      <section style={bookingWorkspaceGrid}>
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
                      <td style={table.cell}>{formatCurrencyAmount(booking.totalPrice, tenantSettings)}</td>
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
          <h2 style={card.title}>Booking Editor</h2>
          <p style={card.subtitle}>
            {selectedBooking ? `${selectedBooking.vehicleName || "Booking"} for ${selectedBooking.customerEmail || "customer"}` : "Select a booking to edit."}
          </p>

          {error && <div style={{ ...badge("danger"), marginTop: "16px", justifyContent: "center" }}>{error}</div>}
          {message && <div style={{ ...badge("success"), marginTop: "16px", justifyContent: "center" }}>{message}</div>}

          {selectedBooking ? (
            <div style={{ ...form.stack, marginTop: "18px" }}>
              <div style={{ ...card.panel, boxShadow: "none", borderRadius: "14px", padding: "16px" }}>
                <div style={{ display: "grid", gap: "10px", color: palette.muted, fontSize: "0.92rem" }}>
                  <span>Base: {formatCurrencyAmount(selectedBooking.basePrice, tenantSettings)}</span>
                  <span>Add-ons: {formatCurrencyAmount(selectedBooking.addonPrice, tenantSettings)}</span>
                  <span>Total: {formatCurrencyAmount(selectedBooking.totalPrice, tenantSettings)}</span>
                  <span>Included: {(selectedBooking.addonNames || []).join(", ") || "None"}</span>
                </div>
                {selectedBooking.specialRequest && (
                  <p style={{ margin: "14px 0 0", color: palette.text, lineHeight: 1.6 }}>{selectedBooking.specialRequest}</p>
                )}
              </div>

              <div style={form.row}>
                <div style={form.field}>
                  <label style={form.label}>Start date</label>
                  <input
                    style={form.input}
                    type="date"
                    value={decision.startDate}
                    onChange={(event) => setDecision({ ...decision, startDate: event.target.value })}
                  />
                </div>
                <div style={form.field}>
                  <label style={form.label}>End date</label>
                  <input
                    style={form.input}
                    type="date"
                    min={decision.startDate || undefined}
                    value={decision.endDate}
                    onChange={(event) => setDecision({ ...decision, endDate: event.target.value })}
                  />
                </div>
              </div>

              <div style={form.field}>
                <label style={form.label}>Status</label>
                <select style={form.input} value={decision.status} onChange={(event) => setDecision({ ...decision, status: event.target.value })}>
                  {BOOKING_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div style={form.row}>
                <div style={form.field}>
                  <label style={form.label}>Approved custom add-on</label>
                  <input
                    style={form.input}
                    value={decision.addonName}
                    onChange={(event) => setDecision({ ...decision, addonName: event.target.value })}
                    placeholder="Example: Airport pickup"
                  />
                </div>
                <div style={form.field}>
                  <label style={form.label}>Approved charge</label>
                  <input
                    style={form.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={decision.addonCharge}
                    onChange={(event) => setDecision({ ...decision, addonCharge: event.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div style={form.field}>
                <label style={form.label}>Admin note</label>
                <textarea
                  style={form.textarea}
                  value={decision.note}
                  onChange={(event) => setDecision({ ...decision, note: event.target.value })}
                  placeholder="Optional note to append to the booking."
                />
              </div>

              <div style={form.actions}>
                <button
                  type="button"
                  style={button.primary}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  style={button.secondary}
                  onClick={() => setDecision({
                    startDate: toDateInputValue(selectedBooking.startDate),
                    endDate: toDateInputValue(selectedBooking.endDate),
                    status: selectedBooking.status || "PENDING",
                    addonName: "",
                    addonCharge: "",
                    note: "",
                  })}
                  disabled={saving}
                >
                  Reset
                </button>
                <button
                  type="button"
                  style={{ ...button.danger, display: "inline-flex", alignItems: "center", gap: "8px" }}
                  onClick={() => openDeleteModal(selectedBooking)}
                  disabled={saving}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div style={{ ...emptyState, marginTop: "18px" }}>No booking selected.</div>
          )}
        </article>
      </section>

      <AdminConfirmModal
        open={deleteState.open}
        title="Delete this booking?"
        description={`This will permanently remove the booking for ${deleteState.label}.`}
        error={error}
        confirmLabel="Delete booking"
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteState({ open: false, id: null, label: "" })}
      />
    </div>
  );
}
