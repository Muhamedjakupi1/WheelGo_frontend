import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { CarFront, Image, LayoutGrid, LogOut, Tags, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { button, layout, palette } from "./adminStyles";

const items = [
  { to: "", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "vehicles", label: "Vehicles", icon: CarFront },
  { to: "vehicle-categories", label: "Categories", icon: Tags },
  { to: "vehicle-images", label: "Vehicle Images", icon: Image },
  { to: "users", label: "Users", icon: Users },
];

export default function AdminLayout() {
  const { tenantSlug } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(`/login/${tenantSlug}`);
  };

  return (
    <div style={layout.shell}>
      <aside style={layout.sidebar}>
        <div style={layout.brand}>
          <div style={layout.brandMark}>WG</div>
          <div>
            <div style={{ color: palette.text, fontWeight: 800, fontSize: "1.05rem" }}>WheelGo Admin</div>
            <div style={{ color: palette.muted, fontSize: "0.86rem" }}>{tenantSlug}</div>
          </div>
        </div>

        <div style={{ padding: "0 8px", color: palette.muted, fontSize: "0.84rem" }}>
          Signed in as <span style={{ color: palette.text, fontWeight: 600 }}>{user?.email}</span>
        </div>

        <nav style={layout.nav}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  textDecoration: "none",
                  color: isActive ? "#fff" : palette.muted,
                  background: isActive ? "linear-gradient(135deg, rgba(56,189,248,0.22), rgba(37,99,235,0.28))" : "transparent",
                  border: isActive ? "1px solid rgba(56,189,248,0.35)" : "1px solid transparent",
                  fontWeight: 600,
                  transition: "0.2s ease",
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button onClick={handleLogout} style={{ ...button.secondary, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </aside>

      <main style={layout.main}>
        <Outlet />
      </main>
    </div>
  );
}

