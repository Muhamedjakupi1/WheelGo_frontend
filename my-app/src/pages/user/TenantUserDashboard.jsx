import React, { useEffect, useState } from "react";
import { Search, MapPin, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getVehicles } from "../../api/vehicleApi";
import { resolveMediaUrl } from "../../utils/media";

const fallbackImage = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80";

export default function TenantUserDashboard() {
  const { user } = useAuth();
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

  const heroVehicle = vehicles[0];
  const featuredVehicles = vehicles.slice(0, 4);

  return (
    <div style={ds.container}>
      <header style={ds.topbar}>
        <div>
          <h1 style={ds.title}>Dashboard</h1>
          <p style={ds.subtitle}>Welcome back, {user?.email}</p>
        </div>

        <div style={ds.actions}>
          <div style={ds.searchBox}>
            <Search size={18} color="#64748b" />
            <input type="text" placeholder="Search car..." style={ds.searchInput} />
          </div>

          <div style={ds.location}>
            <MapPin size={18} />
            <span>Pristina</span>
            <ChevronDown size={15} />
          </div>

          <div style={ds.iconBox}>
            <Bell size={20} />
          </div>

          <img src="https://i.pravatar.cc/100?u=user" alt="avatar" style={ds.avatar} />
        </div>
      </header>

      <section style={ds.hero}>
        <div>
          <h2 style={ds.heroTitle}>
            {heroVehicle ? `${heroVehicle.make} ${heroVehicle.model}` : "RENT THE CAR OF YOUR DREAMS"}
          </h2>
          <p style={ds.heroText}>
            {heroVehicle
              ? `${heroVehicle.categoryName || "Premium vehicle"} • ${heroVehicle.year} • €${heroVehicle.dailyRate}/day`
              : "Choose from premium vehicles with fast delivery."}
          </p>
          <button style={ds.heroBtn}>Book Now</button>
        </div>

        <img
          src={heroVehicle ? resolveMediaUrl(heroVehicle.primaryImageUrl || heroVehicle.imageUrls?.[0]) || fallbackImage : fallbackImage}
          alt={heroVehicle ? `${heroVehicle.make} ${heroVehicle.model}` : "car"}
          style={ds.heroImg}
        />
      </section>

      <div style={ds.grid}>
        {loading ? (
          <div style={{ color: "#94a3b8" }}>Loading vehicles...</div>
        ) : featuredVehicles.length === 0 ? (
          <div style={{ color: "#94a3b8" }}>No vehicles available yet.</div>
        ) : (
          featuredVehicles.map((vehicle) => (
            <CarCard
              key={vehicle.id}
              name={`${vehicle.make} ${vehicle.model}`}
              price={vehicle.dailyRate}
              img={resolveMediaUrl(vehicle.primaryImageUrl || vehicle.imageUrls?.[0]) || fallbackImage}
              category={vehicle.categoryName}
              status={vehicle.status}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CarCard({ name, price, img, category, status }) {
  return (
    <div style={ds.card}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
        <h3 style={ds.cardTitle}>{name}</h3>
        <span style={ds.statusBadge}>{status}</span>
      </div>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>{category || "Vehicle"}</p>

      <img src={img || fallbackImage} alt={name} style={ds.cardImg} />

      <div style={ds.cardBottom}>
        <span>
          <strong style={{ fontSize: "22px" }}>€{price}</strong>/day
        </span>

        <button style={ds.detailsBtn}>Details</button>
      </div>
    </div>
  );
}

const ds = {
  container: { width: "100%", color: "white" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px", gap: "20px", flexWrap: "wrap" },
  title: { fontSize: "30px", fontWeight: "700", margin: 0 },
  subtitle: { marginTop: "6px", color: "#94a3b8", fontSize: "14px" },
  actions: { display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" },
  searchBox: { display: "flex", alignItems: "center", background: "#111827", padding: "12px 16px", borderRadius: "14px", width: "250px", border: "1px solid #1e293b" },
  searchInput: { background: "transparent", border: "none", outline: "none", color: "white", marginLeft: "10px", width: "100%" },
  location: { display: "flex", alignItems: "center", gap: "6px", color: "#3b82f6", cursor: "pointer" },
  iconBox: { width: "42px", height: "42px", borderRadius: "12px", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #1e293b", cursor: "pointer" },
  avatar: { width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid #3b82f6" },
  hero: { background: "#111827", borderRadius: "28px", padding: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px", border: "1px solid #1e293b", flexWrap: "wrap", gap: "20px" },
  heroTitle: { fontSize: "38px", fontWeight: "800", maxWidth: "500px", marginBottom: "15px" },
  heroText: { color: "#94a3b8", marginBottom: "20px" },
  heroBtn: { background: "#3b82f6", color: "white", border: "none", padding: "14px 28px", borderRadius: "12px", cursor: "pointer", fontWeight: "600" },
  heroImg: { width: "420px", maxWidth: "100%", objectFit: "cover", borderRadius: "22px", minHeight: "220px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" },
  card: { background: "#111827", borderRadius: "24px", padding: "25px", border: "1px solid #1e293b" },
  cardTitle: { marginBottom: "10px", marginTop: 0 },
  cardImg: { width: "100%", height: "190px", objectFit: "cover", borderRadius: "18px" },
  cardBottom: { marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  detailsBtn: { background: "#3b82f6", border: "none", color: "white", padding: "10px 20px", borderRadius: "10px", cursor: "pointer" },
  statusBadge: { background: "rgba(59,130,246,0.16)", color: "#60a5fa", padding: "6px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 },
};
