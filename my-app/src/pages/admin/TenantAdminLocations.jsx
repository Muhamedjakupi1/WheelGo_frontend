import { useEffect, useMemo, useState } from "react";
import {
  createAdminLocation,
  deleteAdminLocation,
  getAdminLocations,
  updateAdminLocation,
} from "../../api/adminApi";
import { useIsCompactLayout } from "../../hooks/useIsCompactLayout";
import AdminConfirmModal from "./AdminConfirmModal";
import { badge, button, card, emptyState, form, layout, palette, table, getReadHeavyTwoColumnLayout } from "./adminStyles";

const defaultForm = {
  name: "",
  address: "",
  city: "",
  country: "Kosovo",
  latitude: "",
  longitude: "",
  phone: "",
  isActive: true,
};

const LOCATION_IN_USE_MESSAGE =
  "Vehicles are assigned to this location. Reassign or delete those vehicles first.";
const LOCATION_DELETE_AUTH_FALLBACK_MESSAGES = new Set([
  "Full authentication is required to access this resource",
  "Forbidden",
  "Unauthorized",
]);

export default function TenantAdminLocations() {
  const isCompact = useIsCompactLayout(1100);
  const isWide = useIsCompactLayout(1500);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const isEditing = useMemo(() => selectedId !== null, [selectedId]);
  const workspaceGrid = getReadHeavyTwoColumnLayout(isCompact, isWide);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminLocations();
      setLocations(response.data);
      setSuccess("Locations loaded successfully.");
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Failed to load locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setSelectedId(null);
    setFormData(defaultForm);
    setError("");
  };

  const handleEdit = (location) => {
    const isActive = location.isActive ?? location.active ?? true;
    setSelectedId(location.id);
    setFormData({
      name: location.name || "",
      address: location.address || "",
      city: location.city || "",
      country: location.country || "Kosovo",
      latitude: location.latitude ?? "",
      longitude: location.longitude ?? "",
      phone: location.phone || "",
      isActive,
    });
    setSuccess("");
    setError("");
  };

  const buildCreatePayload = () => ({
    name: formData.name.trim(),
    addres: formData.address.trim(),
    city: formData.city.trim(),
    latitude: formData.latitude === "" ? null : Number(formData.latitude),
    longitude: formData.longitude === "" ? null : Number(formData.longitude),
    phone: formData.phone.trim() || null,
  });

  const buildUpdatePayload = () => ({
    name: formData.name.trim(),
    address: formData.address.trim(),
    city: formData.city.trim(),
    country: formData.country.trim(),
    latitude: formData.latitude === "" ? null : Number(formData.latitude),
    longitude: formData.longitude === "" ? null : Number(formData.longitude),
    phone: formData.phone.trim() || null,
    isActive: formData.isActive,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (isEditing) {
        await updateAdminLocation(selectedId, buildUpdatePayload());
        await loadData();
        setSuccess("Location updated successfully.");
      } else {
        await createAdminLocation(buildCreatePayload());
        await loadData();
        setSuccess("Location created successfully.");
      }

      resetForm();
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Failed to save location.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (location) => {
    setConfirmError("");
    setConfirmDelete({ id: location.id, name: location.name });
  };

  const closeDeleteModal = () => {
    if (confirmLoading) return;
    setConfirmDelete(null);
    setConfirmError("");
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete?.id) return;
    try {
      setConfirmLoading(true);
      setConfirmError("");
      await deleteAdminLocation(confirmDelete.id);
      if (selectedId === confirmDelete.id) resetForm();
      setConfirmDelete(null);
      await loadData();
      setSuccess("Location deleted successfully.");
    } catch (err) {
      setSuccess("");
      const rawMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        LOCATION_IN_USE_MESSAGE;

      const normalizedMessage =
        LOCATION_DELETE_AUTH_FALLBACK_MESSAGES.has(rawMessage)
          ? LOCATION_IN_USE_MESSAGE
          : rawMessage;

      setConfirmError(normalizedMessage);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Locations</h1>
        <p style={card.subtitle}>Create locations first, then assign vehicles to them.</p>
      </section>

      <section style={workspaceGrid}>
        <article style={card.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 style={card.title}>Location List</h2>
              <p style={card.subtitle}>{locations.length} records</p>
            </div>
            <div style={badge("default")}>{loading ? "Loading" : "Ready"}</div>
          </div>

          {loading ? (
            <div style={emptyState}>Loading locations...</div>
          ) : locations.length === 0 ? (
            <div style={emptyState}>No locations created yet.</div>
          ) : (
            <div style={table.wrapper}>
              <table style={table.table}>
                <thead>
                  <tr>
                    <th style={table.headCell}>Name</th>
                    <th style={table.headCell}>City</th>
                    <th style={table.headCell}>Status</th>
                    <th style={table.headCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((location) => (
                    <tr key={location.id}>
                      {(() => {
                        const isActive = location.isActive ?? location.active ?? true;
                        return (
                          <>
                      <td style={table.cell}>
                        <div style={{ fontWeight: 700 }}>{location.name}</div>
                        <div style={{ color: palette.muted, fontSize: "0.84rem", marginTop: "4px" }}>
                          {location.address}
                        </div>
                      </td>
                      <td style={table.cell}>{location.city}, {location.country}</td>
                      <td style={table.cell}>
                        <span style={badge(isActive ? "success" : "danger")}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={table.cell}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button type="button" style={button.ghost} onClick={() => handleEdit(location)}>
                            Edit
                          </button>
                          <button type="button" style={button.danger} onClick={() => openDeleteModal(location)}>
                            Delete
                          </button>
                        </div>
                      </td>
                          </>
                        );
                      })()}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article style={card.panel}>
          <h2 style={card.title}>{isEditing ? "Edit Location" : "Create Location"}</h2>
          <p style={card.subtitle}>
            {isEditing ? "Update the selected location details." : "Create a location that vehicles can be assigned to."}
          </p>

          {error && <div style={{ ...badge("danger"), marginTop: "16px", justifyContent: "center" }}>{error}</div>}
          {success && <div style={{ ...badge("success"), marginTop: "16px", justifyContent: "center" }}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ ...form.stack, marginTop: "18px" }}>
            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Name</label>
                <input style={form.input} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div style={form.field}>
                <label style={form.label}>City</label>
                <input style={form.input} value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
              </div>
            </div>

            <div style={form.field}>
              <label style={form.label}>Address</label>
              <input style={form.input} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Country</label>
                <input style={form.input} value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
              </div>
              <div style={form.field}>
                <label style={form.label}>Phone</label>
                <input style={form.input} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Latitude</label>
                <input style={form.input} type="number" step="0.0000001" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} />
              </div>
              <div style={form.field}>
                <label style={form.label}>Longitude</label>
                <input style={form.input} type="number" step="0.0000001" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} />
              </div>
            </div>

            {isEditing && (
              <label style={{ ...form.label, display: "flex", alignItems: "center", gap: "10px", color: palette.text }}>
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                Location is active
              </label>
            )}

            <div style={form.actions}>
              <button type="submit" style={button.primary} disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Update Location" : "Create Location"}
              </button>
              <button type="button" style={button.secondary} onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>
        </article>
      </section>

      <AdminConfirmModal
        open={Boolean(confirmDelete)}
        title="Delete location?"
        description={
          confirmDelete
            ? `"${confirmDelete.name}" will be removed. ${LOCATION_IN_USE_MESSAGE}`
            : ""
        }
        error={confirmError}
        loading={confirmLoading}
        confirmLabel="Delete location"
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
