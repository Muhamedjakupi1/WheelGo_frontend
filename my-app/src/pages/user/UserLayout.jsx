import React from "react";
import { Outlet, NavLink, useParams, useNavigate } from "react-router-dom";
import { LayoutGrid, Clock, Settings, MessageSquare, User, Headphones, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function UserLayout() {
  const { tenantSlug } = useParams();
  const { logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080a0f" }}>
      <aside style={s.sidebar}>
        <div style={s.logoSection}>
          <h2 style={s.logoText}>CarRent</h2>
        </div>

        <nav style={s.nav}>
          <NavItem to={`/t/${tenantSlug}/app`} icon={<LayoutGrid size={20} />} label="Dashboard" />
           <NavItem to={`/t/${tenantSlug}/bookings`} icon={<Clock size={20} />} label="My Booking" /> 
          <NavItem to={`/t/${tenantSlug}/settings`} icon={<Settings size={20} />} label="Settings" /> 
          <NavItem to={`/t/${tenantSlug}/profile`} icon={<User size={20} />} label="Profile" /> 
          <NavItem to={`/t/${tenantSlug}/support`} icon={<Headphones size={20} />} label="Support" /> 
        </nav>

        <button onClick={handleLogout} style={s.logoutBtn}>
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </aside>


      <main style={s.mainWrapper}>
        <Outlet />
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, to }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      display: "flex",
      alignItems: "center",
      gap: "15px",
      padding: "12px 15px",
      borderRadius: "12px",
      textDecoration: "none",
      background: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
      color: isActive ? "#3b82f6" : "#94a3b8",
      transition: "0.3s",
    })}
  >
    {icon} <span style={{ fontWeight: "500" }}>{label}</span>
  </NavLink>
);

const s = {
  sidebar: {
    width: "260px",
    background: "#0b121e",
    padding: "40px 20px",
    borderRight: "1px solid #1e293b",
    display: "flex",	
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    zIndex: 100,
  },
  logoSection: { marginBottom: "50px", color: "white", paddingLeft: "10px" },
  logoText: { fontSize: "24px", fontWeight: "bold", letterSpacing: "1px" },
  nav: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  mainWrapper: {
    flex: 1,
    marginLeft: "260px", 
    padding: "40px",
    width: "calc(100% - 260px)",
  },
  logoutBtn: {
    marginTop: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "12px",
    background: "transparent",
    border: "1px solid #ef4444",
    color: "#ef4444",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.3s",
  },
};
