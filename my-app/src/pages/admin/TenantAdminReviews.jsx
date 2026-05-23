import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Star } from "lucide-react";
import { getAdminReviews } from "../../api/adminApi";
import { badge, button, card, emptyState, layout, palette, table } from "./adminStyles";

export default function TenantAdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "0.0";
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminReviews();
      setReviews(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Reviews</h1>
            <p style={card.subtitle}>Customer feedback for completed bookings in this tenant.</p>
          </div>
          <button type="button" onClick={loadReviews} style={{ ...button.secondary, display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
        <Metric label="Total reviews" value={reviews.length} />
        <Metric label="Average rating" value={averageRating} />
      </section>

      {error ? <div style={{ ...badge("danger"), justifyContent: "center" }}>{error}</div> : null}

      <section style={card.panel}>
        {loading ? (
          <div style={emptyState}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div style={emptyState}>No reviews have been submitted yet.</div>
        ) : (
          <div style={table.wrapper}>
            <table style={table.table}>
              <thead>
                <tr>
                  <th style={table.headCell}>Customer</th>
                  <th style={table.headCell}>Vehicle</th>
                  <th style={table.headCell}>Rating</th>
                  <th style={table.headCell}>Comment</th>
                  <th style={table.headCell}>Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td style={table.cell}>{review.customerEmail || "Customer"}</td>
                    <td style={table.cell}>{review.vehicleName || "Booked vehicle"}</td>
                    <td style={table.cell}><Rating value={review.rating} /></td>
                    <td style={{ ...table.cell, maxWidth: "420px", color: palette.muted }}>{review.comment || "No comment"}</td>
                    <td style={table.cell}>{formatDate(review.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const Metric = ({ label, value }) => (
  <article style={card.panel}>
    <div style={{ color: palette.muted, fontSize: "0.86rem", marginBottom: "8px" }}>{label}</div>
    <div style={{ color: palette.text, fontSize: "1.8rem", fontWeight: 900 }}>{value}</div>
  </article>
);

const Rating = ({ value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#fbbf24" }}>
    {[1, 2, 3, 4, 5].map((rating) => (
      <Star key={rating} size={16} fill={Number(value) >= rating ? "currentColor" : "none"} />
    ))}
  </div>
);

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
