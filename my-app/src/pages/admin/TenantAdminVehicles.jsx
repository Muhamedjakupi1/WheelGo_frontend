import { useEffect, useMemo, useState } from "react";
import {
  createAdminVehicle,
  deleteAdminVehicle,
  getAdminVehicleCategories,
  getAdminLocations,
  getAdminVehicles,
  updateAdminVehicle,
} from "../../api/adminApi";
import { resolveMediaUrl } from "../../utils/media";
import AdminConfirmModal from "./AdminConfirmModal";
import { badge, button, card, emptyState, form, grid, layout, palette, table } from "./adminStyles";

const defaultForm = {
  categoryId: "",
  locationId: "",
  plateNumber: "",
  make: "",
  model: "",
  year: "",
  color: "",
  vin: "",
  fuelType: "PETROL",
  transmission: "MANUAL",
  seats: "5",
  dailyRate: "",
  status: "AVAILABLE",
  mileage: "0",
};

const fuelOptions = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"];
const transmissionOptions = ["MANUAL", "AUTOMATIC"];
const statusOptions = ["AVAILABLE", "RENTED", "MAINTENANCE", "INACTIVE"];

const vehicleThumbPlaceholder = {
  flexShrink: 0,
  width: 76,
  height: 52,
  borderRadius: "12px",
  border: `1px solid ${palette.border}`,
  background: "#09101c",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.72rem",
  fontWeight: 600,
  color: palette.muted,
};

export default function TenantAdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [vehiclesRes, categoriesRes, locationsRes] = await Promise.all([
        getAdminVehicles(),
        getAdminVehicleCategories(),
        getAdminLocations(),
      ]);
      setVehicles(vehiclesRes.data);
      setCategories(categoriesRes.data);
      setLocations(locationsRes.data);
      setSuccess("Vehicles, categories, and locations loaded successfully.");
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Failed to load vehicles.");
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

  const handleEdit = (vehicle) => {
    setSelectedId(vehicle.id);
    setFormData({
      categoryId: vehicle.categoryId || "",
      locationId: vehicle.locationId || "",
      plateNumber: vehicle.plateNumber || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      color: vehicle.color || "",
      vin: vehicle.vin || "",
      fuelType: vehicle.fuelType || "PETROL",
      transmission: vehicle.transmission || "MANUAL",
      seats: vehicle.seats || "5",
      dailyRate: vehicle.dailyRate || "",
      status: vehicle.status || "AVAILABLE",
      mileage: vehicle.mileage ?? "0",
    });
    setSuccess("");
    setError("");
  };

  const buildPayload = () => ({
    categoryId: formData.categoryId,
    locationId: formData.locationId || null,
    clearLocation: isEditing && !formData.locationId,
    plateNumber: formData.plateNumber,
    make: formData.make,
    model: formData.model,
    year: Number(formData.year),
    color: formData.color || null,
    vin: formData.vin || null,
    fuelType: formData.fuelType,
    transmission: formData.transmission,
    seats: Number(formData.seats),
    dailyRate: Number(formData.dailyRate),
    status: formData.status,
    mileage: Number(formData.mileage || 0),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const payload = buildPayload();

      if (isEditing) {
        await updateAdminVehicle(selectedId, payload);
        await loadData();
        setSuccess("Vehicle updated successfully.");
      } else {
        await createAdminVehicle(payload);
        await loadData();
        setSuccess("Vehicle created successfully.");
      }
      resetForm();
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Failed to save vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (vehicle) => {
    setConfirmError("");
    setConfirmDelete({
      id: vehicle.id,
      label: `${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`,
    });
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
      await deleteAdminVehicle(confirmDelete.id);
      if (selectedId === confirmDelete.id) resetForm();
      setConfirmDelete(null);
      await loadData();
      setSuccess("Vehicle deleted successfully.");
    } catch (err) {
      setSuccess("");
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Failed to delete vehicle.";
      setConfirmError(msg);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Vehicles</h1>
        <p style={card.subtitle}>Create, edit, and remove vehicles for this tenant.</p>
      </section>

      <section style={grid.two}>
        <article style={card.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 style={card.title}>Vehicle Inventory</h2>
              <p style={card.subtitle}>{vehicles.length} records</p>
            </div>
            <div style={badge("default")}>{loading ? "Loading" : "Live list"}</div>
          </div>

          {loading ? (
            <div style={emptyState}>Loading vehicles...</div>
          ) : vehicles.length === 0 ? (
            <div style={emptyState}>No vehicles created yet.</div>
          ) : (
            <div style={table.wrapper}>
              <table style={table.table}>
                <thead>
                  <tr>
                    <th style={{ ...table.headCell, paddingLeft: "14px" }}>Vehicle</th>
                    <th style={table.headCell}>Category</th>
                    <th style={table.headCell}>Location</th>
                    <th style={table.headCell}>Rate</th>
                    <th style={table.headCell}>Status</th>
                    <th style={table.headCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => {
                    const thumbSrc = resolveMediaUrl(vehicle.primaryImageUrl);
                    const imgAlt = `${vehicle.make} ${vehicle.model}`.trim() || "Vehicle";
                    return (
                      <tr key={vehicle.id}>
                        <td style={{ ...table.cell, verticalAlign: "middle", paddingLeft: "14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px", minHeight: "52px" }}>
                            {thumbSrc ? (
                              <img
                                src={thumbSrc}
                                alt={imgAlt}
                                loading="lazy"
                                style={{
                                  flexShrink: 0,
                                  width: 76,
                                  height: 52,
                                  objectFit: "cover",
                                  borderRadius: "12px",
                                  border: `1px solid ${palette.border}`,
                                  background: "#09101c",
                                }}
                              />
                            ) : (
                              <div style={vehicleThumbPlaceholder} aria-hidden>
                                No photo
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700 }}>{vehicle.make} {vehicle.model}</div>
                              <div style={{ color: palette.muted, fontSize: "0.88rem", marginTop: "4px" }}>
                                {vehicle.plateNumber} • {vehicle.year}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={table.cell}>{vehicle.categoryName || "-"}</td>
                        <td style={table.cell}>{vehicle.locationName || "-"}</td>
                        <td style={table.cell}>€{vehicle.dailyRate}</td>
                        <td style={{ ...table.cell, verticalAlign: "middle" }}>
                          <span style={badge(vehicle.status === "AVAILABLE" ? "success" : vehicle.status === "RENTED" ? "warning" : "danger")}>{vehicle.status}</span>
                        </td>
                        <td style={{ ...table.cell, verticalAlign: "middle" }}>
                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <button type="button" style={button.ghost} onClick={() => handleEdit(vehicle)}>
                              Edit
                            </button>
                            <button type="button" style={button.danger} onClick={() => openDeleteModal(vehicle)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article style={card.panel}>
          <h2 style={card.title}>{isEditing ? "Edit Vehicle" : "Create Vehicle"}</h2>
          <p style={card.subtitle}>{isEditing ? "Update the selected vehicle details." : "Add a new vehicle to the tenant inventory."}</p>

          {error && <div style={{ ...badge("danger"), marginTop: "16px", justifyContent: "center" }}>{error}</div>}
          {success && <div style={{ ...badge("success"), marginTop: "16px", justifyContent: "center" }}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ ...form.stack, marginTop: "18px" }}>
            <div style={form.field}>
              <label style={form.label}>Category</label>
              <select style={form.input} value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div style={form.field}>
              <label style={form.label}>Location</label>
              <select
                style={form.input}
                value={formData.locationId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    locationId: e.target.value,
                  })
                }
              >
                <option value="">No location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Plate Number</label>
                <input style={form.input} value={formData.plateNumber} onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })} required />
              </div>
              <div style={form.field}>
                <label style={form.label}>Year</label>
                <input style={form.input} type="number" min="1900" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} required />
              </div>
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Make</label>
                <input style={form.input} value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} required />
              </div>
              <div style={form.field}>
                <label style={form.label}>Model</label>
                <input style={form.input} value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
              </div>
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Fuel Type</label>
                <select style={form.input} value={formData.fuelType} onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}>
                  {fuelOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div style={form.field}>
                <label style={form.label}>Transmission</label>
                <select style={form.input} value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}>
                  {transmissionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Seats</label>
                <input style={form.input} type="number" min="1" value={formData.seats} onChange={(e) => setFormData({ ...formData, seats: e.target.value })} required />
              </div>
              <div style={form.field}>
                <label style={form.label}>Mileage</label>
                <input style={form.input} type="number" min="0" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} required />
              </div>
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Daily Rate</label>
                <input style={form.input} type="number" min="0.01" step="0.01" value={formData.dailyRate} onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })} required />
              </div>
              <div style={form.field}>
                <label style={form.label}>Status</label>
                <select style={form.input} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Color</label>
                <input style={form.input} value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
              </div>
              <div style={form.field}>
                <label style={form.label}>VIN</label>
                <input style={form.input} value={formData.vin} onChange={(e) => setFormData({ ...formData, vin: e.target.value })} />
              </div>
            </div>

            <div style={form.actions}>
              <button type="submit" style={button.primary} disabled={saving || categories.length === 0}>{saving ? "Saving..." : isEditing ? "Update Vehicle" : "Create Vehicle"}</button>
              <button type="button" style={button.secondary} onClick={resetForm}>Reset</button>
            </div>
          </form>
        </article>
      </section>

      <AdminConfirmModal
        open={Boolean(confirmDelete)}
        title="Delete this vehicle?"
        description={
          confirmDelete
            ? `${confirmDelete.label} will be permanently removed from the inventory, along with dependent records enforced by the server.`
            : ""
        }
        error={confirmError}
        loading={confirmLoading}
        confirmLabel="Delete vehicle"
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

