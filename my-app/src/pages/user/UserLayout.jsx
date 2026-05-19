import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useParams, useNavigate } from "react-router-dom";
<<<<<<< Updated upstream
import { LayoutGrid, Clock, Settings, User, Headphones, LogOut } from "lucide-react";
=======
import { LayoutGrid, Clock, Settings, User, Headphones, LogOut, CreditCard } from "lucide-react";
>>>>>>> Stashed changes
import { useAuth } from "../../context/AuthContext";

export default function UserLayout() {
  const { tenantSlug } = useParams();
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 960 : false
  );

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth <= 960);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (loading) return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ display: isCompact ? "block" : "flex", minHeight: "100vh", background: "#080a0f" }}>
      <aside style={{ ...s.sidebar, ...(isCompact ? s.sidebarCompact : {}) }}>
        <div style={s.brand}>
          <div style={s.brandMark}>WG</div>
          <div>
            <div style={s.brandTitle}>WheelGo User</div>
            <div style={s.brandSlug}>{tenantSlug}</div>
          </div>
        </div>

        <div style={s.signedIn}>
          Signed in as <span style={s.signedInEmail}>{user?.email}</span>
        </div>

        <nav style={{ ...s.nav, ...(isCompact ? s.navCompact : {}) }}>
          <NavItem to={`/t/${tenantSlug}/app`} icon={<LayoutGrid size={20} />} label="Dashboard" />
           <NavItem to={`/t/${tenantSlug}/bookings`} icon={<Clock size={20} />} label="My Booking" /> 
          <NavItem to={`/t/${tenantSlug}/payments`} icon={<CreditCard size={20} />} label="Payments" />
          <NavItem to={`/t/${tenantSlug}/settings`} icon={<Settings size={20} />} label="Settings" /> 
          <NavItem to={`/t/${tenantSlug}/profile`} icon={<User size={20} />} label="Profile" /> 
          <NavItem to={`/t/${tenantSlug}/support`} icon={<Headphones size={20} />} label="Support" /> 
        </nav>

        <button onClick={handleLogout} style={{ ...s.logoutBtn, ...(isCompact ? s.logoutBtnCompact : {}) }}>
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </aside>


      <main style={{ ...s.mainWrapper, ...(isCompact ? s.mainWrapperCompact : {}) }}>
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
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "28px",
    padding: "0 8px",
  },
  brandMark: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #38bdf8, #2563eb)",
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontWeight: 900,
    letterSpacing: "0.02em",
  },
  brandTitle: {
    color: "#fff",
    fontWeight: 800,
    fontSize: "1.05rem",
  },
  brandSlug: {
    color: "#94a3b8",
    fontSize: "0.86rem",
    marginTop: "4px",
  },
  signedIn: {
    padding: "0 8px",
    color: "#94a3b8",
    fontSize: "0.84rem",
    marginBottom: "34px",
    lineHeight: 1.6,
  },
  signedInEmail: {
    color: "#fff",
    fontWeight: 700,
    display: "block",
  },
  nav: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  navCompact: { flexDirection: "row", flexWrap: "wrap" },
  mainWrapper: {
    flex: 1,
    marginLeft: "260px", 
    padding: "40px",
    width: "calc(100% - 260px)",
  },
  mainWrapperCompact: {
    marginLeft: 0,
    width: "100%",
    padding: "20px 16px 28px",
  },
  sidebarCompact: {
    position: "static",
    width: "100%",
    height: "auto",
    padding: "18px 16px",
    gap: "16px",
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
  logoutBtnCompact: {
    marginTop: 0,
  },
};
