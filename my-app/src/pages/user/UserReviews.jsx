import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getMyReviews } from "../../api/reviewApi";

export default function TenantUserReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyReviews()
      .then((response) => {
        if (active) {
          setReviews(Array.isArray(response.data) ? response.data : []);
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.response?.data?.message || "Failed to load reviews.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main style={s.mainContent}>
      <header style={s.topbar}>
        <div>
          <h1 style={s.greeting}>My Reviews</h1>
          <p style={s.subtitle}>Reviews you submitted for completed bookings.</p>
        </div>
        <div style={s.infoPill}>
          <Star size={18} />
          <span>{reviews.length} reviews</span>
        </div>
      </header>

      {error ? <div style={s.errorBanner}>{error}</div> : null}

      {loading ? (
        <div style={s.emptyState}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={s.emptyState}>No reviews submitted yet.</div>
      ) : (
        <section style={s.reviewGrid}>
          {reviews.map((review) => (
            <article key={review.id} style={s.reviewCard}>
              <div style={s.reviewHeader}>
                <div>
                  <h2 style={s.vehicleName}>{review.vehicleName || "Booked Vehicle"}</h2>
                  <p style={s.reviewDate}>{formatDate(review.createdAt)}</p>
                </div>
                <Rating value={review.rating} />
              </div>
              <p style={s.comment}>{review.comment || "No comment added."}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

const Rating = ({ value }) => (
  <div style={s.rating}>
    {[1, 2, 3, 4, 5].map((rating) => (
      <Star
        key={rating}
        size={18}
        fill={Number(value) >= rating ? "currentColor" : "none"}
      />
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

const s = {
  mainContent: { flex: 1, padding: "40px", overflowY: "auto" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", gap: "20px", flexWrap: "wrap" },
  greeting: { fontSize: "32px", fontWeight: "700", margin: 0, color: "#fff" },
  subtitle: { color: "#94a3b8", marginTop: 5 },
  infoPill: { display: "flex", alignItems: "center", gap: "8px", background: "#161f2e", padding: "10px 20px", borderRadius: "10px", border: "1px solid #2d3748", color: "#cbd5e1" },
  errorBanner: { background: "rgba(127, 29, 29, 0.25)", color: "#fecaca", border: "1px solid #7f1d1d", borderRadius: "14px", padding: "12px 14px", marginBottom: "20px" },
  emptyState: { background: "#0b121e", border: "1px solid #1e293b", borderRadius: "18px", color: "#94a3b8", padding: "22px" },
  reviewGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" },
  reviewCard: { background: "#0b121e", border: "1px solid #1e293b", borderRadius: "18px", padding: "18px" },
  reviewHeader: { display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "flex-start" },
  vehicleName: { margin: 0, color: "#fff", fontSize: "18px" },
  reviewDate: { margin: "6px 0 0", color: "#64748b", fontSize: "13px" },
  rating: { display: "flex", gap: "3px", color: "#fbbf24" },
  comment: { color: "#cbd5e1", lineHeight: 1.6, margin: "16px 0 0" },
};
