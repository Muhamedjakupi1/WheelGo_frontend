import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  MapPin,
  Receipt,
  Search,
} from "lucide-react";
import { getMyBookings } from "../../api/bookingApi";
import { useTenantSettings } from "../../context/TenantSettingsContext";
import { useIsCompactLayout } from "../../hooks/useIsCompactLayout";
import { formatCurrencyAmount } from "../../utils/currency";
import { resolveMediaUrl } from "../../utils/media";

const fallbackImage =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";

export default function TenantBookingPage() {
  const { settings: tenantSettings } = useTenantSettings();
  const isCompact = useIsCompactLayout(900);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadBookings = async (keyword = "") => {
      try {
        setLoading(true);
        const response = await getMyBookings(keyword);
        setBookings(Array.isArray(response.data) ? response.data : []);
        setError("");
      } catch (err) {
        console.error("Failed to load bookings", err);
        setError(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load your bookings."
        );
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      loadBookings(searchTerm.trim());
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const activeBooking = bookings[0] || null;
  const bookingHistory = bookings.slice(0, 10);

  return (
    <div>
      <main style={{ ...s.mainContent, ...(isCompact ? s.mainContentCompact : {}) }}>
        <header style={s.topbar}>
          <div>
            <h1 style={s.greeting}>My Bookings</h1>
            <p style={{ color: "#64748b", marginTop: 5 }}>
              See your saved reservations and the latest booking details.
            </p>
          </div>

          <div style={s.filterActions}>
            <div style={s.searchBox}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={s.searchInput}
              />
            </div>
            <div style={s.infoPill}>
              <Receipt size={18} />
              <span>{bookings.length} total bookings</span>
            </div>
            <div style={s.datePicker}>
              <CalendarIcon size={18} />
              <span>Latest first</span>
            </div>
          </div>
        </header>

        {error ? <div style={s.errorBanner}>{error}</div> : null}

        <section style={{ ...s.activeBookingCard, ...(isCompact ? s.activeBookingCardCompact : {}) }}>
          <div style={s.activeBadge}>Latest Booking</div>
          {loading ? (
            <div style={{ color: "#94a3b8" }}>Loading booking details...</div>
          ) : activeBooking ? (
            <div style={{ ...s.activeContent, ...(isCompact ? s.activeContentCompact : {}) }}>
              <div style={{ ...s.carInfo, ...(isCompact ? s.carInfoCompact : {}) }}>
                <h2 style={{ fontSize: 28, margin: 0 }}>{activeBooking.vehicleName || "Booked Vehicle"}</h2>
                <p style={{ color: "#94a3b8" }}>
                  {formatDateRange(activeBooking.startDate, activeBooking.endDate)} • {activeBooking.totalDays} day(s)
                </p>

                <div style={s.statusTimeline}>
                  <div style={s.timelinePoint}>
                    <CheckCircle2 size={16} color="#3b82f6" /> {formatStatus(activeBooking.status)}
                  </div>
                  <div style={s.timelineLine}></div>
                  <div style={s.timelinePoint}>
                    <MapPin size={16} color="#64748b" /> {activeBooking.locationName || "Location not set"}
                  </div>
                  <div style={s.timelineLine}></div>
                  <div style={s.timelinePoint}>
                    <AlertCircle size={16} color="#64748b" /> {formatCurrencyAmount(activeBooking.totalPrice, tenantSettings)}
                  </div>
                </div>

                <div style={s.bookingMetaGrid}>
                  <MetaCard label="Base price" value={formatCurrencyAmount(activeBooking.basePrice, tenantSettings)} />
                  <MetaCard label="Add-ons" value={formatCurrencyAmount(activeBooking.addonPrice, tenantSettings)} />
                  <MetaCard
                    label="Baby seat"
                    value={activeBooking.babySeatRequested ? "Requested" : "No"}
                  />
                  <MetaCard
                    label="Approved add-ons"
                    value={(activeBooking.addonNames || []).join(", ") || "None"}
                  />
                  <MetaCard
                    label="Special request"
                    value={activeBooking.specialRequest || "None"}
                  />
                </div>
              </div>
              <img
                src={resolveMediaUrl(activeBooking.vehicleImageUrl) || fallbackImage}
                alt={activeBooking.vehicleName || "booked car"}
                style={{ ...s.activeCarImg, ...(isCompact ? s.activeCarImgCompact : {}) }}
              />
            </div>
          ) : (
            <div style={{ color: "#94a3b8" }}>You do not have any bookings yet.</div>
          )}
        </section>

        <section style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 22, marginBottom: 20 }}>Booking History</h3>
          <div style={s.tableContainer}>
            {loading ? (
              <div style={{ color: "#94a3b8", padding: "12px" }}>Loading bookings...</div>
            ) : bookingHistory.length === 0 ? (
              <div style={{ color: "#94a3b8", padding: "12px" }}>No bookings found.</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr style={s.tableHeaderRow}>
                    <th style={s.th}>Car</th>
                    <th style={s.th}>Dates</th>
                    <th style={s.th}>Location</th>
                    <th style={s.th}>Total</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {bookingHistory.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      car={booking.vehicleName || "Booked Vehicle"}
                      dateRange={formatDateRange(booking.startDate, booking.endDate)}
                      location={booking.locationName || "-"}
                      price={formatCurrencyAmount(booking.totalPrice, tenantSettings)}
                      status={booking.status}
                      img={resolveMediaUrl(booking.vehicleImageUrl) || fallbackImage}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

const MetaCard = ({ label, value }) => (
  <div style={s.metaCard}>
    <div style={s.metaLabel}>{label}</div>
    <div style={s.metaValue}>{value}</div>
  </div>
);

const BookingRow = ({ car, dateRange, location, price, status, img }) => (
  <tr style={s.tr}>
    <td style={s.td}>
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <div style={s.tableImgBox}>
          <img
            src={img}
            width="52"
            height="40"
            style={{ objectFit: "cover", borderRadius: "8px" }}
            alt="car"
          />
        </div>
        <span style={{ fontWeight: "600" }}>{car}</span>
      </div>
    </td>
    <td style={s.td}>{dateRange}</td>
    <td style={s.td}>{location}</td>
    <td style={s.td}>{price}</td>
    <td style={s.td}>
      <span style={getStatusBadgeStyle(status)}>{formatStatus(status)}</span>
    </td>
    <td style={s.td}>
      <ChevronRight size={18} color="#64748b" />
    </td>
  </tr>
);

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "-";
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(value) {
  return (value || "PENDING")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPrice(value) {
  return Number(value || 0).toFixed(2);
}

function getStatusBadgeStyle(status) {
  if (status === "CANCELLED") {
    return {
      ...s.statusBadge,
      background: "rgba(239, 68, 68, 0.14)",
      color: "#f87171",
      border: "1px solid rgba(248, 113, 113, 0.32)",
    };
  }

  return s.statusBadge;
}

const s = {
  mainContent: { flex: 1, padding: "40px", overflowY: "auto" },
  mainContentCompact: { padding: "20px 0 28px" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", gap: "20px", flexWrap: "wrap" },
  greeting: { fontSize: "32px", fontWeight: "700", margin: 0, color: "#fff" },
  filterActions: { display: "flex", gap: "15px", flexWrap: "wrap" },
  searchBox: { display: "flex", alignItems: "center", gap: "8px", background: "#161f2e", padding: "10px 14px", borderRadius: "10px", border: "1px solid #2d3748", color: "#cbd5e1" },
  searchInput: { width: "190px", background: "transparent", border: "none", outline: "none", color: "#fff" },
  infoPill: { display: "flex", alignItems: "center", gap: "8px", background: "#161f2e", padding: "10px 20px", borderRadius: "10px", border: "1px solid #2d3748", color: "#cbd5e1" },
  datePicker: { display: "flex", alignItems: "center", gap: "8px", background: "#3b82f6", padding: "10px 20px", borderRadius: "10px", color: "#fff" },
  errorBanner: { background: "rgba(127, 29, 29, 0.25)", color: "#fecaca", border: "1px solid #7f1d1d", borderRadius: "14px", padding: "12px 14px", marginBottom: "20px" },
  activeBookingCard: { background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "28px", padding: "40px", border: "1px solid #334155", position: "relative", overflow: "hidden" },
  activeBookingCardCompact: { padding: "22px 18px" },
  activeBadge: { background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6", padding: "6px 15px", borderRadius: "20px", fontSize: 12, fontWeight: "700", width: "fit-content", marginBottom: 20 },
  activeContent: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", flexWrap: "wrap" },
  activeContentCompact: { flexDirection: "column", alignItems: "stretch" },
  carInfo: { flex: 1, minWidth: "300px" },
  carInfoCompact: { minWidth: 0 },
  activeCarImg: { width: "42%", minWidth: "280px", minHeight: "240px", objectFit: "cover", borderRadius: "20px", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.35))" },
  activeCarImgCompact: { width: "100%", minWidth: 0, minHeight: "200px" },
  statusTimeline: { display: "flex", alignItems: "center", gap: "10px", marginTop: 30, flexWrap: "wrap" },
  timelinePoint: { display: "flex", alignItems: "center", gap: "5px", fontSize: 14 },
  timelineLine: { height: "2px", width: "40px", background: "#3b82f6" },
  bookingMetaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginTop: "24px" },
  metaCard: { background: "rgba(15, 23, 42, 0.6)", border: "1px solid #334155", borderRadius: "16px", padding: "14px" },
  metaLabel: { color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" },
  metaValue: { color: "#fff", fontWeight: "600", lineHeight: 1.45 },
  tableContainer: { background: "#0b121e", borderRadius: "24px", padding: "20px", border: "1px solid #1e293b", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "15px", color: "#64748b", fontWeight: "500", borderBottom: "1px solid #1e293b" },
  tr: { borderBottom: "1px solid #1e293b" },
  td: { padding: "20px 15px" },
  tableImgBox: { background: "#161f2e", padding: "5px", borderRadius: "8px" },
  statusBadge: { background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "5px 12px", borderRadius: "8px", fontSize: 13 },
};

