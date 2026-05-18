import { useEffect, useMemo, useState } from "react";
import {
  createAdminMaintenance,
  deleteAdminMaintenance,
  getAdminMaintenances,
  getAdminMaintenanceTypes,
  getAdminVehicles,
  updateAdminMaintenance,
} from "../../api/adminApi";
import { useIsCompactLayout } from "../../hooks/useIsCompactLayout";
import { formatCurrencyAmount } from "../../utils/currency";
import { useTenantSettings } from "../../context/TenantSettingsContext";
import AdminConfirmModal from "./AdminConfirmModal";
import { badge, button, card, emptyState, form, layout, palette, table, getReadHeavyTwoColumnLayout } from "./adminStyles";

const defaultForm = {
  vehicleId: "",
  type: "",
  description: "",
  cost: "",
  performedAt: "",
  nextDueAt: "",
  performedBy: "",
};

const toDateTimeLocalValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
};

const toPayloadDateTime = (value) => (value ? `${value}:00` : null);

export default function TenantAdminMaintenance() {
  const { settings: tenantSettings } = useTenantSettings();
  const isCompact = useIsCompactLayout(1100);
  const isWide = useIsCompactLayout(1500);
  const workspaceGrid = getReadHeavyTwoColumnLayout(isCompact, isWide);

  const [maintenances, setMaintenances] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [types, setTypes] = useState([]);
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

  const activeVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === formData.vehicleId) || null,
    [vehicles, formData.vehicleId]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [maintenancesRes, typesRes, vehiclesRes] = await Promise.all([
        getAdminMaintenances(),
        getAdminMaintenanceTypes(),
        getAdminVehicles(),
      ]);
      setMaintenances(maintenancesRes.data);
      setTypes(typesRes.data);
      setVehicles(vehiclesRes.data);
      setSuccess("Maintenance records, vehicles, and types loaded successfully.");
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Failed to load maintenance data.");
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

  const handleEdit = (record) => {
    setSelectedId(record.id);
    setFormData({
      vehicleId: record.vehicleId || "",
      type: record.type || "",
      description: record.description || "",
      cost: record.cost ?? "",
      performedAt: toDateTimeLocalValue(record.performedAt),
      nextDueAt: toDateTimeLocalValue(record.nextDueAt),
      performedBy: record.performedBy || "",
    });
    setError("");
    setSuccess("");
  };

  const buildPayload = () => ({
    vehicleId: formData.vehicleId,
    type: formData.type,
    description: formData.description || null,
    cost: formData.cost === "" ? null : Number(formData.cost),
    performedAt: toPayloadDateTime(formData.performedAt),
    nextDueAt: toPayloadDateTime(formData.nextDueAt),
    performedBy: formData.performedBy || null,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const payload = buildPayload();

      if (isEditing) {
        await updateAdminMaintenance(selectedId, payload);
        setSuccess("Maintenance record updated successfully.");
      } else {
        await createAdminMaintenance(payload);
        setSuccess("Maintenance record created and vehicle moved to maintenance.");
      }

      await loadData();
      resetForm();
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Failed to save maintenance record.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (record) => {
    setConfirmError("");
    setConfirmDelete({
      id: record.id,
      label: `${record.vehicleName || "Vehicle"}${record.plateNumber ? ` (${record.plateNumber})` : ""}`,
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
      await deleteAdminMaintenance(confirmDelete.id);
      if (selectedId === confirmDelete.id) resetForm();
      setConfirmDelete(null);
      await loadData();
      setSuccess("Maintenance record deleted successfully.");
    } catch (err) {
      setSuccess("");
      setConfirmError(err.response?.data?.message || "Failed to delete maintenance record.");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Maintenance</h1>
        <p style={card.subtitle}>
          Put vehicles into maintenance, update service details, and remove the record when the vehicle is ready to return.
        </p>
      </section>

      <section style={workspaceGrid}>
        <article style={card.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 style={card.title}>Maintenance Records</h2>
              <p style={card.subtitle}>{maintenances.length} active records</p>
            </div>
            <div style={badge("default")}>{loading ? "Loading" : "Live list"}</div>
          </div>

          {loading ? (
            <div style={emptyState}>Loading maintenance records...</div>
          ) : maintenances.length === 0 ? (
            <div style={emptyState}>No maintenance records created yet.</div>
          ) : (
            <div style={table.wrapper}>
              <table style={table.table}>
                <thead>
                  <tr>
                    <th style={{ ...table.headCell, paddingLeft: "14px" }}>Vehicle</th>
                    <th style={table.headCell}>Type</th>
                    <th style={table.headCell}>Performed</th>
                    <th style={table.headCell}>Cost</th>
                    <th style={table.headCell}>Status</th>
                    <th style={table.headCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenances.map((record) => (
                    <tr key={record.id}>
                      <td style={{ ...table.cell, paddingLeft: "14px" }}>
                        <div style={{ fontWeight: 700 }}>{record.vehicleName || "Vehicle"}</div>
                        <div style={{ color: palette.muted, fontSize: "0.88rem", marginTop: "4px" }}>
                          {record.plateNumber || "No plate"} {record.performedBy ? `• ${record.performedBy}` : ""}
                        </div>
                      </td>
                      <td style={table.cell}>{record.type}</td>
                      <td style={table.cell}>
                        {record.performedAt ? new Date(record.performedAt).toLocaleString() : "-"}
                        {record.nextDueAt ? (
                          <div style={{ color: palette.muted, fontSize: "0.84rem", marginTop: "4px" }}>
                            Available again: {new Date(record.nextDueAt).toLocaleDateString()}
                          </div>
                        ) : null}
                      </td>
                      <td style={table.cell}>
                        {record.cost != null ? formatCurrencyAmount(record.cost, tenantSettings) : "-"}
                      </td>
                      <td style={table.cell}>
                        <span style={badge("warning")}>MAINTENANCE</span>
                      </td>
                      <td style={table.cell}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button type="button" style={button.ghost} onClick={() => handleEdit(record)}>
                            Edit
                          </button>
                          <button type="button" style={button.danger} onClick={() => openDeleteModal(record)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article style={card.panel}>
          <h2 style={card.title}>{isEditing ? "Edit Maintenance" : "Create Maintenance"}</h2>
          <p style={card.subtitle}>
            Saving a record moves the selected vehicle into <strong>MAINTENANCE</strong> and blocks user bookings until the available-again date you set.
          </p>

          {error && <div style={{ ...badge("danger"), marginTop: "16px", justifyContent: "center" }}>{error}</div>}
          {success && <div style={{ ...badge("success"), marginTop: "16px", justifyContent: "center" }}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ ...form.stack, marginTop: "18px" }}>
            <div style={form.field}>
              <label style={form.label}>Vehicle</label>
              <select
                style={form.input}
                value={formData.vehicleId}
                onChange={(event) => setFormData({ ...formData, vehicleId: event.target.value })}
                required
              >
                <option value="">Select vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.plateNumber})
                  </option>
                ))}
              </select>
              {activeVehicle ? (
                <div style={{ color: palette.muted, fontSize: "0.84rem" }}>
                  Current vehicle status: <span style={{ color: palette.text }}>{activeVehicle.status}</span>
                </div>
              ) : null}
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Maintenance Type</label>
                <select
                  style={form.input}
                  value={formData.type}
                  onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                  required
                >
                  <option value="">Select type</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div style={form.field}>
                <label style={form.label}>Cost</label>
                <input
                  style={form.input}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(event) => setFormData({ ...formData, cost: event.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Performed At</label>
                <input
                  style={form.input}
                  type="datetime-local"
                  value={formData.performedAt}
                  onChange={(event) => setFormData({ ...formData, performedAt: event.target.value })}
                  required
                />
              </div>
              <div style={form.field}>
                <label style={form.label}>Available Again From</label>
                <input
                  style={form.input}
                  type="datetime-local"
                  value={formData.nextDueAt}
                  onChange={(event) => setFormData({ ...formData, nextDueAt: event.target.value })}
                />
                <div style={{ color: palette.muted, fontSize: "0.84rem" }}>
                  Users can book this vehicle starting on this date.
                </div>
              </div>
            </div>

            <div style={form.field}>
              <label style={form.label}>Performed By</label>
              <input
                style={form.input}
                value={formData.performedBy}
                onChange={(event) => setFormData({ ...formData, performedBy: event.target.value })}
                placeholder="Technician, garage, or service center"
              />
            </div>

            <div style={form.field}>
              <label style={form.label}>Description</label>
              <textarea
                style={form.textarea}
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                placeholder="Describe what was serviced and any notes for the team."
              />
            </div>

            <div style={form.actions}>
              <button type="submit" style={button.primary} disabled={saving || vehicles.length === 0 || types.length === 0}>
                {saving ? "Saving..." : isEditing ? "Update Maintenance" : "Create Maintenance"}
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
        title="Delete this maintenance record?"
        description={
          confirmDelete
            ? `${confirmDelete.label} will lose its current maintenance record. If no other maintenance record exists for that vehicle, it can return to booking availability automatically.`
            : ""
        }
        error={confirmError}
        loading={confirmLoading}
        confirmLabel="Delete maintenance"
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
