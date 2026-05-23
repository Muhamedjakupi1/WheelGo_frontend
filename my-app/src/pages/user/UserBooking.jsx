import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  CreditCard,
  MapPin,
  Receipt,
  Search,
  Star,
  X,
} from "lucide-react";
import { cancelMyBooking, getMyBookings } from "../../api/bookingApi";
import { payForBooking } from "../../api/paymentApi";
import { createReview } from "../../api/reviewApi";
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
  const [paying, setPaying] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [message, setMessage] = useState("");
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
  const [paymentForm, setPaymentForm] = useState({
    method: "CARD",
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    promotionCode: "",
  });

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
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

  useEffect(() => {
    loadBookings();
  }, []);

  const activeBooking = bookings[0] || null;
  const bookingHistory = bookings.slice(0, 10);
  const pendingReviewBooking = bookings.find(canReviewBooking) || null;
  const canPay =
    paymentBooking &&
    (paymentForm.method === "CASH" ||
      (paymentForm.cardholderName.trim() &&
        paymentForm.cardNumber.replace(/\D/g, "").length >= 12 &&
        paymentForm.expiryMonth.trim() &&
        paymentForm.expiryYear.trim() &&
        paymentForm.cvv.replace(/\D/g, "").length >= 3));

  const openPayment = (booking) => {
    setPaymentBooking(booking);
    setMessage("");
    setError("");
    setPaymentForm({
      method: "CARD",
      cardholderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      promotionCode: "",
    });
  };

  const closePayment = () => {
    if (paying) return;
    setPaymentBooking(null);
  };

  const openReview = (booking) => {
    setReviewBooking(booking);
    setReviewForm({ rating: 5, comment: "" });
    setMessage("");
    setError("");
  };

  const closeReview = () => {
    if (reviewSubmitting) return;
    setReviewBooking(null);
  };

  const updatePaymentField = (field, value) => {
    setPaymentForm((current) => ({ ...current, [field]: value }));
  };

  const handlePay = async () => {
    if (!canPay || paying) return;

    try {
      setPaying(true);
      setError("");
      setMessage("");
      const response = await payForBooking({
        bookingId: paymentBooking.id,
        method: paymentForm.method,
        currency: tenantSettings?.currency || "EUR",
        cardholderName: paymentForm.cardholderName.trim(),
        cardNumber: paymentForm.cardNumber,
        expiryMonth: paymentForm.expiryMonth,
        expiryYear: paymentForm.expiryYear,
        cvv: paymentForm.cvv,
        promotionCode: paymentForm.promotionCode.trim() || null,
      });
      setMessage(
        paymentForm.method === "CASH"
          ? "Cash payment selected. Booking is pending until admin confirmation."
          : `Payment completed. Invoice ${response.data?.invoiceNumber || ""} will be sent by email.`
      );
      setPaymentBooking(null);
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Payment failed.");
    } finally {
      setPaying(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!booking || !window.confirm("Cancel this pending booking?")) return;

    try {
      setError("");
      setMessage("");
      await cancelMyBooking(booking.id);
      setMessage("Booking cancelled.");
      setExpandedId(null);
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to cancel booking.");
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewBooking || reviewSubmitting) return;

    try {
      setReviewSubmitting(true);
      setError("");
      setMessage("");
      await createReview({
        bookingId: reviewBooking.id,
        vehicleId: reviewBooking.vehicleId,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim() || null,
      });
      setMessage("Review submitted. Thank you for sharing your experience.");
      setReviewBooking(null);
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

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
        {message ? <div style={s.successBanner}>{message}</div> : null}
        {pendingReviewBooking ? (
          <ReviewPrompt booking={pendingReviewBooking} onReview={() => openReview(pendingReviewBooking)} />
        ) : null}

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
                  <MetaCard
                    label="Payment"
                    value={formatPaymentStatus(activeBooking)}
                  />
                  <MetaCard
                    label="Balance due"
                    value={formatCurrencyAmount(activeBooking.outstandingAmount, tenantSettings)}
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
                  {bookingHistory.map((booking) => {
                    const expanded = expandedId === booking.id;
                    return (
                      <React.Fragment key={booking.id}>
                        <BookingRow
                          booking={booking}
                          car={booking.vehicleName || "Booked Vehicle"}
                          dateRange={formatDateRange(booking.startDate, booking.endDate)}
                          location={booking.locationName || "-"}
                          price={formatCurrencyAmount(booking.totalPrice, tenantSettings)}
                          status={booking.status}
                          img={resolveMediaUrl(booking.vehicleImageUrl) || fallbackImage}
                          expanded={expanded}
                          onToggle={() => setExpandedId(expanded ? null : booking.id)}
                        />
                        {expanded ? (
                          <BookingDetailsRow
                            booking={booking}
                            tenantSettings={tenantSettings}
                            onPay={() => openPayment(booking)}
                            onCancel={() => handleCancelBooking(booking)}
                            onReview={() => openReview(booking)}
                          />
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {paymentBooking ? (
        <PaymentModal
          booking={paymentBooking}
          form={paymentForm}
          paying={paying}
          canPay={canPay}
          tenantSettings={tenantSettings}
          onChange={updatePaymentField}
          onPay={handlePay}
          onClose={closePayment}
        />
      ) : null}
      {reviewBooking ? (
        <ReviewModal
          booking={reviewBooking}
          form={reviewForm}
          submitting={reviewSubmitting}
          onChange={setReviewForm}
          onSubmit={handleSubmitReview}
          onClose={closeReview}
        />
      ) : null}
    </div>
  );
}

const MetaCard = ({ label, value }) => (
  <div style={s.metaCard}>
    <div style={s.metaLabel}>{label}</div>
    <div style={s.metaValue}>{value}</div>
  </div>
);

const ReviewPrompt = ({ booking, onReview }) => (
  <section style={s.reviewPrompt}>
    <div>
      <div style={s.reviewPromptTitle}>Review your completed booking</div>
      <div style={s.reviewPromptText}>
        {booking.vehicleName || "Booked Vehicle"} finished on {formatDate(booking.endDate)}.
      </div>
    </div>
    <button type="button" style={s.reviewBtn} onClick={onReview}>
      <Star size={16} />
      Write review
    </button>
  </section>
);

const BookingRow = ({ car, dateRange, location, price, status, img, expanded, onToggle }) => (
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
      <button type="button" style={s.iconBtn} onClick={onToggle} aria-label="Toggle booking details">
        {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
    </td>
  </tr>
);

const BookingDetailsRow = ({ booking, tenantSettings, onPay, onCancel, onReview }) => (
  <tr style={s.expandedTr}>
    <td style={s.expandedTd} colSpan={6}>
      <div style={s.expandedPanel}>
        <div style={s.detailGrid}>
          <MetaCard label="Base price" value={formatCurrencyAmount(booking.basePrice, tenantSettings)} />
          <MetaCard label="Add-ons" value={formatCurrencyAmount(booking.addonPrice, tenantSettings)} />
          <MetaCard label="Total" value={formatCurrencyAmount(booking.totalPrice, tenantSettings)} />
          <MetaCard label="Paid" value={formatCurrencyAmount(booking.paidAmount, tenantSettings)} />
          <MetaCard label="Balance due" value={formatCurrencyAmount(booking.outstandingAmount, tenantSettings)} />
          <MetaCard label="Included" value={(booking.addonNames || []).join(", ") || "None"} />
          <MetaCard label="Special request" value={booking.specialRequest || "None"} />
          <MetaCard label="Payment" value={formatPaymentStatus(booking)} />
        </div>
        <div style={s.expandedActions}>
          {canReviewBooking(booking) ? (
            <button type="button" style={s.reviewBtn} onClick={onReview}>
              <Star size={16} />
              Write review
            </button>
          ) : canPayBooking(booking) ? (
            <>
              {booking.status === "PENDING" ? (
                <button type="button" style={s.cancelBtn} onClick={onCancel}>
                  Cancel
                </button>
              ) : null}
              <button type="button" style={s.payBtn} onClick={onPay}>
                <CreditCard size={16} />
                Pay balance
              </button>
            </>
          ) : booking.paymentStatus === "PAID" ? (
            <span style={s.paidText}>Payment confirmed</span>
          ) : booking.paymentStatus === "PENDING" ? (
            <span style={s.pendingPaymentText}>Awaiting cash confirmation</span>
          ) : booking.status === "PENDING" ? (
            <>
              <button type="button" style={s.cancelBtn} onClick={onCancel}>
                Cancel
              </button>
              <button type="button" style={s.payBtn} onClick={onPay}>
                <CreditCard size={16} />
                Pay
              </button>
            </>
          ) : (
            <span style={s.paidText}>{formatStatus(booking.status)}</span>
          )}
        </div>
      </div>
    </td>
  </tr>
);

const ReviewModal = ({ booking, form, submitting, onChange, onSubmit, onClose }) => (
  <div style={s.modalOverlay} onClick={onClose}>
    <div style={s.modalCard} onClick={(event) => event.stopPropagation()}>
      <div style={s.modalHeader}>
        <div>
          <h2 style={s.modalTitle}>Write Review</h2>
          <p style={s.modalSubtitle}>{booking.vehicleName || "Booked Vehicle"} - {formatDateRange(booking.startDate, booking.endDate)}</p>
        </div>
        <button type="button" style={s.closeBtn} onClick={onClose} aria-label="Close review">
          <X size={18} />
        </button>
      </div>

      <div style={s.ratingRow}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            style={{ ...s.starBtn, ...(Number(form.rating) >= rating ? s.starBtnActive : {}) }}
            onClick={() => onChange((current) => ({ ...current, rating }))}
            aria-label={`${rating} star review`}
          >
            <Star size={22} fill={Number(form.rating) >= rating ? "currentColor" : "none"} />
          </button>
        ))}
      </div>

      <label style={s.fieldGroup}>
        <span style={s.fieldLabel}>Comment</span>
        <textarea
          style={s.textarea}
          rows={4}
          value={form.comment}
          onChange={(event) => onChange((current) => ({ ...current, comment: event.target.value }))}
          placeholder="How was the booking?"
        />
      </label>

      <button type="button" style={{ ...s.payBtnWide, ...(submitting ? s.disabledBtn : {}) }} disabled={submitting} onClick={onSubmit}>
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  </div>
);

const PaymentModal = ({ booking, form, paying, canPay, tenantSettings, onChange, onPay, onClose }) => (
  <div style={s.modalOverlay} onClick={onClose}>
    <div style={s.modalCard} onClick={(event) => event.stopPropagation()}>
      <div style={s.modalHeader}>
        <div>
          <h2 style={s.modalTitle}>Pay Booking</h2>
          <p style={s.modalSubtitle}>{booking.vehicleName || "Booked Vehicle"} - {formatCurrencyAmount(paymentDueAmount(booking), tenantSettings)}</p>
        </div>
        <button type="button" style={s.closeBtn} onClick={onClose} aria-label="Close payment">
          <X size={18} />
        </button>
      </div>

      <div style={s.paymentSummary}>
        <PriceLine label="Dates" value={formatDateRange(booking.startDate, booking.endDate)} />
        <PriceLine label="Method" value={form.method === "CASH" ? "Cash" : "Card"} />
        {Number(booking.discountAmount || 0) > 0 ? (
          <PriceLine label="Discount" value={`-${formatCurrencyAmount(booking.discountAmount, tenantSettings)}`} />
        ) : null}
        <PriceLine label="Balance due" value={formatCurrencyAmount(paymentDueAmount(booking), tenantSettings)} />
      </div>

      <label style={s.fieldGroup}>
        <span style={s.fieldLabel}>Promotion Code</span>
        <input
          style={s.input}
          value={form.promotionCode}
          onChange={(e) => onChange("promotionCode", e.target.value)}
          placeholder="WheelGo-10"
        />
      </label>

      <div style={s.methodToggle}>
        <button type="button" style={{ ...s.methodBtn, ...(form.method === "CARD" ? s.methodBtnActive : {}) }} onClick={() => onChange("method", "CARD")}>
          Card
        </button>
        <button type="button" style={{ ...s.methodBtn, ...(form.method === "CASH" ? s.methodBtnActive : {}) }} onClick={() => onChange("method", "CASH")}>
          Cash
        </button>
      </div>

      {form.method === "CARD" ? (
        <>
          <label style={s.fieldGroup}>
            <span style={s.fieldLabel}>Cardholder Name</span>
            <input style={s.input} value={form.cardholderName} onChange={(e) => onChange("cardholderName", e.target.value)} />
          </label>

          <label style={s.fieldGroup}>
            <span style={s.fieldLabel}>Card Number</span>
            <input
              style={s.input}
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              value={form.cardNumber}
              onChange={(e) => onChange("cardNumber", formatCardNumber(e.target.value))}
            />
          </label>

          <div style={s.paymentGrid}>
            <label style={s.fieldGroup}>
              <span style={s.fieldLabel}>Month</span>
              <input style={s.input} inputMode="numeric" maxLength={2} placeholder="12" value={form.expiryMonth} onChange={(e) => onChange("expiryMonth", onlyDigits(e.target.value).slice(0, 2))} />
            </label>
            <label style={s.fieldGroup}>
              <span style={s.fieldLabel}>Year</span>
              <input style={s.input} inputMode="numeric" maxLength={4} placeholder="2028" value={form.expiryYear} onChange={(e) => onChange("expiryYear", onlyDigits(e.target.value).slice(0, 4))} />
            </label>
            <label style={s.fieldGroup}>
              <span style={s.fieldLabel}>CVV</span>
              <input style={s.input} inputMode="numeric" maxLength={4} value={form.cvv} onChange={(e) => onChange("cvv", onlyDigits(e.target.value).slice(0, 4))} />
            </label>
          </div>
        </>
      ) : (
        <div style={s.cashNotice}>Cash payment will keep the booking pending until admin confirmation.</div>
      )}

      <button type="button" style={{ ...s.payBtnWide, ...(!canPay || paying ? s.disabledBtn : {}) }} disabled={!canPay || paying} onClick={onPay}>
        {paying ? "Processing..." : form.method === "CASH" ? "Choose Cash Payment" : "Pay"}
      </button>
    </div>
  </div>
);

const PriceLine = ({ label, value }) => (
  <div style={s.priceLine}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "-";
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatDate(value) {
  const datePart = extractDatePart(value);
  if (!datePart) return "-";
  return new Date(`${datePart}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function extractDatePart(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatStatus(value) {
  return (value || "PENDING")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPaymentStatus(booking) {
  if (booking?.paymentStatus === "REFUNDED") {
    return "Payment refunded";
  }
  if (booking?.status === "CANCELLED" && booking?.paymentStatus && booking.paymentStatus !== "PAID") {
    return "Payment cancelled";
  }
  if (!booking?.paymentStatus) {
    return "Not paid";
  }

  const method = booking.paymentMethod === "CASH" ? "Cash" : "Card";
  if (booking.paymentStatus === "PAID") {
    return `${method} confirmed`;
  }
  if (booking.paymentStatus === "PENDING") {
    return `${method} pending`;
  }
  return `${method} ${formatStatus(booking.paymentStatus).toLowerCase()}`;
}

function paymentDueAmount(booking) {
  return Number(booking?.outstandingAmount || 0) > 0 ? booking.outstandingAmount : booking?.totalPrice;
}

function canPayBooking(booking) {
  return (
    Number(booking?.outstandingAmount || 0) > 0 &&
    booking?.paymentStatus !== "PENDING" &&
    booking?.status !== "CANCELLED" &&
    booking?.status !== "COMPLETED"
  );
}

function canReviewBooking(booking) {
  return (
    booking?.status === "COMPLETED" &&
    Boolean(booking?.reviewEligible) &&
    !booking?.reviewSubmittedAt
  );
}

function onlyDigits(value) {
  return (value || "").replace(/\D/g, "");
}

function formatCardNumber(value) {
  return onlyDigits(value).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
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
  successBanner: { background: "rgba(20, 83, 45, 0.25)", color: "#bbf7d0", border: "1px solid #14532d", borderRadius: "14px", padding: "12px 14px", marginBottom: "20px" },
  reviewPrompt: { background: "rgba(245, 158, 11, 0.12)", color: "#fde68a", border: "1px solid rgba(245, 158, 11, 0.36)", borderRadius: "16px", padding: "16px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" },
  reviewPromptTitle: { color: "#fff", fontWeight: 800, marginBottom: "4px" },
  reviewPromptText: { color: "#fcd34d", fontSize: "14px" },
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
  iconBtn: { width: "34px", height: "34px", borderRadius: "10px", border: "1px solid #334155", background: "#111827", color: "#94a3b8", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  expandedTr: { borderBottom: "1px solid #1e293b" },
  expandedTd: { padding: "0 15px 20px" },
  expandedPanel: { background: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "16px", display: "grid", gap: "16px" },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" },
  expandedActions: { display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" },
  payBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "12px", padding: "11px 16px", cursor: "pointer", fontWeight: 800 },
  cancelBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.32)", borderRadius: "12px", padding: "11px 16px", cursor: "pointer", fontWeight: 800 },
  reviewBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#f59e0b", color: "#111827", border: "none", borderRadius: "12px", padding: "11px 16px", cursor: "pointer", fontWeight: 800 },
  paidText: { color: "#94a3b8", fontSize: "14px" },
  pendingPaymentText: { color: "#fbbf24", fontSize: "14px", fontWeight: 700 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(2, 6, 23, 0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", zIndex: 1000 },
  modalCard: { width: "min(520px, 100%)", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "22px", padding: "22px", boxShadow: "0 30px 70px rgba(0,0,0,0.45)", display: "grid", gap: "16px" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" },
  modalTitle: { margin: 0, color: "#fff", fontSize: "24px" },
  modalSubtitle: { margin: "8px 0 0", color: "#94a3b8" },
  closeBtn: { border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  paymentSummary: { background: "#111827", border: "1px solid #1e293b", borderRadius: "14px", padding: "14px", display: "grid", gap: "10px" },
  priceLine: { display: "flex", justifyContent: "space-between", gap: "12px", color: "#94a3b8" },
  methodToggle: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" },
  methodBtn: { border: "1px solid #334155", background: "#111827", color: "#94a3b8", borderRadius: "12px", padding: "12px 14px", cursor: "pointer", fontWeight: 800 },
  methodBtnActive: { border: "1px solid rgba(96,165,250,0.55)", background: "rgba(37,99,235,0.22)", color: "#fff" },
  cashNotice: { background: "rgba(30,64,175,0.18)", color: "#bfdbfe", border: "1px solid rgba(96,165,250,0.45)", borderRadius: "14px", padding: "12px 14px" },
  fieldGroup: { display: "grid", gap: "8px" },
  fieldLabel: { color: "#94a3b8", fontSize: "13px", fontWeight: 700 },
  input: { width: "100%", background: "#111827", border: "1px solid #334155", color: "#fff", borderRadius: "12px", padding: "12px 14px", outline: "none" },
  textarea: { width: "100%", resize: "vertical", background: "#111827", border: "1px solid #334155", color: "#fff", borderRadius: "12px", padding: "12px 14px", outline: "none", fontFamily: "inherit" },
  ratingRow: { display: "flex", gap: "8px" },
  starBtn: { width: "42px", height: "42px", borderRadius: "12px", border: "1px solid #334155", background: "#111827", color: "#64748b", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  starBtnActive: { border: "1px solid rgba(245, 158, 11, 0.55)", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" },
  paymentGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
  payBtnWide: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "12px", padding: "13px 16px", cursor: "pointer", fontWeight: 800 },
  disabledBtn: { opacity: 0.55, cursor: "not-allowed" },
};
