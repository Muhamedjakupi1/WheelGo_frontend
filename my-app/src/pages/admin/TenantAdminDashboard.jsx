import { useEffect, useState } from "react";
import { CarFront, Image, Tags, Users } from "lucide-react";
import {
  getAdminUsers,
  getAdminVehicleCategories,
  getAdminVehicleImages,
  getAdminVehicles,
} from "../../api/adminApi";
import { badge, card, grid, layout, palette } from "./adminStyles";

const statsConfig = [
  { key: "vehicles", label: "Vehicles", icon: CarFront, tone: "default" },
  { key: "categories", label: "Categories", icon: Tags, tone: "success" },
  { key: "images", label: "Images", icon: Image, tone: "warning" },
  { key: "users", label: "Users", icon: Users, tone: "danger" },
];

export default function TenantAdminDashboard() {
  const [stats, setStats] = useState({ vehicles: 0, categories: 0, images: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [vehicles, categories, images, users] = await Promise.all([
          getAdminVehicles(),
          getAdminVehicleCategories(),
          getAdminVehicleImages(),
          getAdminUsers(),
        ]);

        setStats({
          vehicles: vehicles.data.length,
          categories: categories.data.length,
          images: images.data.length,
          users: users.data.length,
        });
        setSuccess("Admin dashboard loaded successfully.");
      } catch (err) {
        setSuccess("");
        setError(err.response?.data?.message || "Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "2rem", color: palette.text }}>Tenant Admin Dashboard</h1>
            <p style={{ margin: "8px 0 0", color: palette.muted, maxWidth: "720px" }}>
              Manage your rental inventory, keep vehicle media organized, and maintain access for tenant users from one place.
            </p>
          </div>
          <div style={badge("default")}>{loading ? "Refreshing" : "Live tenant data"}</div>
        </div>
      </section>

      {error && <section style={{ ...card.panel, borderColor: "rgba(248,113,113,0.35)", color: palette.danger }}>{error}</section>}
      {success && <section style={{ ...card.panel, borderColor: "rgba(52,211,153,0.35)", color: palette.success }}>{success}</section>}

      <section style={grid.cards}>
        {statsConfig.map(({ key, label, icon: Icon, tone }) => (
          <article key={key} style={card.panel}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={badge(tone)}>{label}</div>
              <Icon size={20} color={tone === "success" ? palette.success : tone === "warning" ? palette.warning : tone === "danger" ? palette.danger : palette.primary} />
            </div>
            <div style={{ marginTop: "18px", fontSize: "2rem", fontWeight: 800, color: palette.text }}>
              {loading ? "--" : stats[key]}
            </div>
            <div style={{ marginTop: "6px", color: palette.muted, fontSize: "0.92rem" }}>
              {label === "Users" ? "Accounts inside this tenant" : `Active ${label.toLowerCase()} records`}
            </div>
          </article>
        ))}
      </section>

      <section style={grid.cards}>
        <article style={card.panel}>
          <h2 style={card.title}>Recommended Setup Order</h2>
          <p style={card.subtitle}>This follows the real tenant setup flow and keeps booking, vehicle, and maintenance data consistent.</p>
          <ol style={{ margin: "18px 0 0", paddingLeft: "20px", color: palette.text, lineHeight: 1.8 }}>
            <li>Create locations first so vehicles have a valid pickup and return point.</li>
            <li>Create vehicle categories to keep inventory grouped cleanly.</li>
            <li>Create vehicles and assign both category and location.</li>
            <li>Upload vehicle images and mark one image as primary.</li>
            <li>Configure add-ons before taking live bookings.</li>
            <li>Review tenant users and keep admin access limited to the right accounts.</li>
            <li>Use bookings to manage date changes, confirmations, and cancellations after inventory is ready.</li>
            <li>Use maintenance records whenever a vehicle should be blocked until a specific available-again date.</li>
          </ol>
        </article>

        <article style={card.panel}>
          <h2 style={card.title}>Current Admin Scope</h2>
          <p style={card.subtitle}>These pages are tenant-scoped. Your actions only affect the current tenant context.</p>
          <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={badge("success")}>Vehicle CRUD enabled</div>
            <div style={badge("default")}>Category CRUD enabled</div>
            <div style={badge("warning")}>Vehicle image CRUD enabled</div>
            <div style={badge("danger")}>User editing enabled</div>
          </div>
        </article>
      </section>
    </div>
  );
}

