import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { CalendarCheck, CarFront, Image, LayoutGrid, LogOut, MapPin, Package, Tags, Users, Wrench } from "lucide-react";
import { getAdminTenantSettings } from "../../api/adminApi";
import { useAuth } from "../../context/AuthContext";
import { useIsCompactLayout } from "../../hooks/useIsCompactLayout";
import { button, layout, palette } from "./adminStyles";

const items = [
  { to: "", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "vehicles", label: "Vehicles", icon: CarFront },
  { to: "locations", label: "Locations", icon: MapPin },
  { to: "vehicle-categories", label: "Categories", icon: Tags },
  { to: "vehicle-images", label: "Vehicle Images", icon: Image },
  { to: "users", label: "Users", icon: Users },
  { to: "bookings", label: "Bookings", icon: CalendarCheck },
  { to: "maintenance", label: "Maintenance", icon: Wrench },
  { to: "addons", label: "Add-ons", icon: Package },
];

export default function AdminLayout() {
  const { tenantSlug } = useParams();
  const { user, logout, stopImpersonation, isImpersonating } = useAuth();
  const navigate = useNavigate();
  const [themeColor, setThemeColor] = useState(null);
  const [impersonationError, setImpersonationError] = useState("");
  const [stoppingImpersonation, setStoppingImpersonation] = useState(false);
  const isCompact = useIsCompactLayout(1100);

  useEffect(() => {
    let active = true;

    getAdminTenantSettings()
      .then(({ data }) => {
        if (active) {
          setThemeColor(data?.themeColor || null);
        }
      })
      .catch(() => {
        if (active) {
          setThemeColor(null);
        }
      });

    return () => {
      active = false;
    };
  }, [tenantSlug]);

  const handleLogout = async () => {
    await logout();
    navigate(`/login/${tenantSlug}`);
  };

  const handleStopImpersonation = async () => {
    try {
      setStoppingImpersonation(true);
      setImpersonationError("");
      await stopImpersonation();
      navigate("/superadmin/tenants", { replace: true });
    } catch (err) {
      setImpersonationError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        "Failed to stop impersonation."
      );
    } finally {
      setStoppingImpersonation(false);
    }
  };

  const shellStyle = themeColor ? { ...layout.shell, background: themeColor } : layout.shell;
  const mainStyle = themeColor ? { ...layout.main, background: themeColor } : layout.main;

  return (
    <div style={{ ...shellStyle, ...(isCompact ? { display: "block" } : {}) }}>
      <aside
        style={{
          ...layout.sidebar,
          ...(isCompact
            ? {
              position: "static",
              width: "100%",
              inset: "auto",
              borderRight: "none",
              borderBottom: `1px solid ${palette.border}`,
              padding: "18px 16px",
            }
            : {
              overflowY: "auto",
              height: "100vh",
            }),
        }}
      >
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

        <nav style={isCompact ? layout.navCompact : { ...layout.nav, overflowY: "auto", flex: 1, minHeight: 0 }}>
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

      <main
        style={{
          ...mainStyle,
          ...(isCompact
            ? {
              marginLeft: 0,
              width: "100%",
              padding: "20px 16px 28px",
            }
            : {}),
        }}
      >
        {isImpersonating && (
          <section
            style={{
              marginBottom: "20px",
              padding: "16px 18px",
              borderRadius: "18px",
              border: "1px solid rgba(74, 222, 128, 0.28)",
              background: "linear-gradient(135deg, rgba(21, 128, 61, 0.22), rgba(15, 23, 42, 0.82))",
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ color: palette.text, fontWeight: 800 }}>Impersonation active</div>
              <div style={{ color: palette.muted, marginTop: "4px", fontSize: "0.92rem" }}>
                You are acting as this tenant&apos;s admin. All changes in this area affect tenant <strong style={{ color: palette.text }}>{tenantSlug}</strong>.
              </div>
              {impersonationError && (
                <div style={{ color: palette.danger, marginTop: "8px", fontSize: "0.9rem" }}>{impersonationError}</div>
              )}
            </div>

            <button
              type="button"
              onClick={handleStopImpersonation}
              disabled={stoppingImpersonation}
              style={{
                ...button.secondary,
                minWidth: "180px",
                opacity: stoppingImpersonation ? 0.7 : 1,
                cursor: stoppingImpersonation ? "not-allowed" : "pointer",
              }}
            >
              {stoppingImpersonation ? "Stopping..." : "Stop impersonation"}
            </button>
          </section>
        )}
        <Outlet />
      </main>
    </div>
  );
}
