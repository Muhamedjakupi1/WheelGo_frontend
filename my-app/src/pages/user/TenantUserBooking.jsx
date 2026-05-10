import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { getVehicles } from "../../api/vehicleApi";
import { resolveMediaUrl } from "../../utils/media";

const fallbackImage = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";

export default function TenantBookingPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await getVehicles();
        setVehicles(response.data);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  const activeVehicle = vehicles[0];
  const historyVehicles = vehicles.slice(0, 6);

  return (
    <div>
      <main style={s.mainContent}>
        <header style={s.topbar}>
          <div>
            <h1 style={s.greeting}>Available Vehicles</h1>
            <p style={{ color: "#64748b", marginTop: 5 }}>Browse the fleet and inspect each vehicle with its real photo</p>
          </div>

          <div style={s.filterActions}>
            <div style={s.filterBtn}>
              <Filter size={18} />
              <span>Filter</span>
            </div>
            <div style={s.datePicker}>
              <CalendarIcon size={18} />
              <span>All Vehicles</span>
            </div>
          </div>
        </header>

        <section style={s.activeBookingCard}>
          <div style={s.activeBadge}>Featured Vehicle</div>
          {loading ? (
            <div style={{ color: "#94a3b8" }}>Loading vehicle details...</div>
          ) : activeVehicle ? (
            <div style={s.activeContent}>
              <div style={s.carInfo}>
                <h2 style={{ fontSize: 28, margin: 0 }}>{activeVehicle.make} {activeVehicle.model}</h2>
                <p style={{ color: "#94a3b8" }}>
                  {activeVehicle.categoryName || "Vehicle"} • {activeVehicle.year} • {activeVehicle.transmission}
                </p>

                <div style={s.statusTimeline}>
                  <div style={s.timelinePoint}><CheckCircle2 size={16} color="#3b82f6" /> Ready</div>
                  <div style={s.timelineLine}></div>
                  <div style={s.timelinePoint}><AlertCircle size={16} color="#64748b" /> {activeVehicle.status}</div>
                  <div style={s.timelineLine} opacity="0.3"></div>
                  <div style={s.timelinePoint} color="#64748b">€{activeVehicle.dailyRate}/day</div>
                </div>
              </div>
              <img
                src={resolveMediaUrl(activeVehicle.primaryImageUrl || activeVehicle.imageUrls?.[0]) || fallbackImage}
                alt={`${activeVehicle.make} ${activeVehicle.model}`}
                style={s.activeCarImg}
              />
            </div>
          ) : (
            <div style={{ color: "#94a3b8" }}>No vehicles available right now.</div>
          )}
        </section>

        <section style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 22, marginBottom: 20 }}>Fleet Overview</h3>
          <div style={s.tableContainer}>
            {loading ? (
              <div style={{ color: "#94a3b8", padding: "12px" }}>Loading vehicles...</div>
            ) : historyVehicles.length === 0 ? (
              <div style={{ color: "#94a3b8", padding: "12px" }}>No vehicles found.</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr style={s.tableHeaderRow}>
                    <th style={s.th}>Car</th>
                    <th style={s.th}>Plate</th>
                    <th style={s.th}>Category</th>
                    <th style={s.th}>Price</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {historyVehicles.map((vehicle) => (
                    <BookingRow
                      key={vehicle.id}
                      car={`${vehicle.make} ${vehicle.model}`}
                      plate={vehicle.plateNumber}
                      category={vehicle.categoryName || "-"}
                      price={`€${vehicle.dailyRate}/day`}
                      status={vehicle.status}
                      img={resolveMediaUrl(vehicle.primaryImageUrl || vehicle.imageUrls?.[0]) || fallbackImage}
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

const BookingRow = ({ car, plate, category, price, status, img }) => (
  <tr style={s.tr}>
    <td style={s.td}>
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <div style={s.tableImgBox}><img src={img} width="52" height="40" style={{ objectFit: "cover", borderRadius: "8px" }} alt="car" /></div>
        <span style={{ fontWeight: "600" }}>{car}</span>
      </div>
    </td>
    <td style={s.td}>{plate}</td>
    <td style={s.td}>{category}</td>
    <td style={s.td}>{price}</td>
    <td style={s.td}>
      <span style={s.statusBadge}>{status}</span>
    </td>
    <td style={s.td}><ChevronRight size={18} color="#64748b" cursor="pointer" /></td>
  </tr>
);

const s = {
  mainContent: { flex: 1, padding: "40px", overflowY: "auto" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
  greeting: { fontSize: "32px", fontWeight: "700", margin: 0, color: "#fff" },
  filterActions: { display: "flex", gap: "15px" },
  filterBtn: { display: "flex", alignItems: "center", gap: "8px", background: "#161f2e", padding: "10px 20px", borderRadius: "10px", border: "1px solid #2d3748", cursor: "pointer" },
  datePicker: { display: "flex", alignItems: "center", gap: "8px", background: "#3b82f6", padding: "10px 20px", borderRadius: "10px", cursor: "pointer" },
  activeBookingCard: { background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "28px", padding: "40px", border: "1px solid #334155", position: "relative", overflow: "hidden" },
  activeBadge: { background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6", padding: "6px 15px", borderRadius: "20px", fontSize: 12, fontWeight: "700", width: "fit-content", marginBottom: 20 },
  activeContent: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px" },
  carInfo: { flex: 1 },
  activeCarImg: { width: "45%", minHeight: "240px", objectFit: "cover", borderRadius: "20px", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.35))" },
  statusTimeline: { display: "flex", alignItems: "center", gap: "10px", marginTop: 30, flexWrap: "wrap" },
  timelinePoint: { display: "flex", alignItems: "center", gap: "5px", fontSize: 14 },
  timelineLine: { height: "2px", width: "40px", background: "#3b82f6" },
  tableContainer: { background: "#0b121e", borderRadius: "24px", padding: "20px", border: "1px solid #1e293b" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "15px", color: "#64748b", fontWeight: "500", borderBottom: "1px solid #1e293b" },
  tr: { borderBottom: "1px solid #1e293b" },
  td: { padding: "20px 15px" },
  tableImgBox: { background: "#161f2e", padding: "5px", borderRadius: "8px" },
  statusBadge: { background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "5px 12px", borderRadius: "8px", fontSize: 13 },
};
