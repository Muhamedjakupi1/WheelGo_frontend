import React from "react";
import { Search, MapPin, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function TenantUserDashboard() {
  const { user } = useAuth();

  return (
    <div style={ds.container}>

      <header style={ds.topbar}>
        <div>
          <h1 style={ds.title}>Dashboard</h1>
          <p style={ds.subtitle}>Welcome back, {user?.email}</p>
        </div>

        <div style={ds.actions}>
          {/* Search */}
          <div style={ds.searchBox}>
            <Search size={18} color="#64748b" />
            <input
              type="text"
              placeholder="Search car..."
              style={ds.searchInput}
            />
          </div>

          <div style={ds.location}>
            <MapPin size={18} />
            <span>Pristina</span>
            <ChevronDown size={15} />
          </div>

          <div style={ds.iconBox}>
            <Bell size={20} />
          </div>

          <img
            src="https://i.pravatar.cc/100?u=user"
            alt="avatar"
            style={ds.avatar}
          />
        </div>
      </header>


      <section style={ds.hero}>
        <div>
          <h2 style={ds.heroTitle}>
            RENT THE CAR OF YOUR DREAMS
          </h2>
          <p style={ds.heroText}>
            Choose from premium vehicles with fast delivery.
          </p>
          <button style={ds.heroBtn}>Book Now</button>
        </div>

        <img
          src="https://www.pngplay.com/wp-content/uploads/13/Audi-A7-Transparent-Images.png"
          alt="car"
          style={ds.heroImg}
        />
      </section>

      {/* CARDS */}
      <div style={ds.grid}>
        <CarCard
          name="Mercedes AMG"
          price="89"
          img="https://freepngimg.com/save/31514-mercedes-benz-ml-class-side-view-car-png/940x477"
        />

        <CarCard
          name="BMW M5"
          price="95"
          img="https://www.pngplay.com/wp-content/uploads/13/Mercedes-Benz-CL-Class-Transparent-Images.png"
        />
      </div>
    </div>
  );
}

function CarCard({ name, price, img }) {
  return (
    <div style={ds.card}>
      <h3 style={ds.cardTitle}>{name}</h3>

      <img src={img} alt={name} style={ds.cardImg} />

      <div style={ds.cardBottom}>
        <span>
          <strong style={{ fontSize: "22px" }}>${price}</strong>/day
        </span>

        <button style={ds.detailsBtn}>Details</button>
      </div>
    </div>
  );
}

const ds = {
  container: {
    width: "100%",
    color: "white",
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px",
    gap: "20px",
    flexWrap: "wrap",
  },

  title: {
    fontSize: "30px",
    fontWeight: "700",
    margin: 0,
  },

  subtitle: {
    marginTop: "6px",
    color: "#94a3b8",
    fontSize: "14px",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "#111827",
    padding: "12px 16px",
    borderRadius: "14px",
    width: "250px",
    border: "1px solid #1e293b",
  },

  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    marginLeft: "10px",
    width: "100%",
  },

  location: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#3b82f6",
    cursor: "pointer",
  },

  iconBox: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #1e293b",
    cursor: "pointer",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #3b82f6",
  },

  hero: {
    background: "#111827",
    borderRadius: "28px",
    padding: "40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px",
    border: "1px solid #1e293b",
    flexWrap: "wrap",
    gap: "20px",
  },

  heroTitle: {
    fontSize: "38px",
    fontWeight: "800",
    maxWidth: "500px",
    marginBottom: "15px",
  },

  heroText: {
    color: "#94a3b8",
    marginBottom: "20px",
  },

  heroBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  heroImg: {
    width: "420px",
    maxWidth: "100%",
    objectFit: "contain",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
  },

  card: {
    background: "#111827",
    borderRadius: "24px",
    padding: "25px",
    border: "1px solid #1e293b",
  },

  cardTitle: {
    marginBottom: "15px",
  },

  cardImg: {
    width: "100%",
    height: "160px",
    objectFit: "contain",
  },

  cardBottom: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailsBtn: {
    background: "#3b82f6",
    border: "none",
    color: "white",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
  },
};