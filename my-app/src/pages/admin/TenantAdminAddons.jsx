import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  createAdminAddon,
  deleteAdminAddon,
  ensureAdminDefaultAddons,
  getAdminAddons,
  updateAdminAddon,
} from "../../api/adminApi";
import { useTenantSettings } from "../../context/TenantSettingsContext";
import { formatCurrencyAmount } from "../../utils/currency";
import AdminConfirmModal from "./AdminConfirmModal";
import { badge, button, card, emptyState, form, grid, layout, palette, table } from "./adminStyles";

const defaultForm = {
  name: "",
  description: "",
  price: "",
  quantity: "",
  type: "ONE_TIME",
  isActive: true,
};

export default function TenantAdminAddons() {
  const { settings: tenantSettings } = useTenantSettings();
  const [addons, setAddons] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteState, setDeleteState] = useState({ open: false, id: null, label: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedAddon = useMemo(
    () => addons.find((addon) => addon.id === selectedId) || null,
    [addons, selectedId]
  );

  const isEditing = Boolean(selectedAddon);

  const loadAddons = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminAddons();
      setAddons(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load add-ons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddons();
  }, []);

  const resetForm = () => {
    setSelectedId(null);
    setFormData(defaultForm);
    setError("");
  };

  const handleEnsureDefaults = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const response = await ensureAdminDefaultAddons();
      setAddons(Array.isArray(response.data) ? response.data : []);
      setSuccess("Default add-ons are ready.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create default add-ons.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = (addon) => {
    setSelectedId(addon.id);
    setFormData({
      name: addon.name || "",
      description: addon.description || "",
      price: addon.price ?? "",
      quantity: addon.quantity ?? 0,
      type: addon.type || "ONE_TIME",
      isActive: addon.isActive ?? true,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: Number(formData.price || 0),
        quantity: Number(formData.quantity || 0),
        type: formData.type,
        isActive: formData.isActive,
      };

      if (isEditing) {
        await updateAdminAddon(selectedId, payload);
      } else {
        await createAdminAddon(payload);
      }

      await loadAddons();
      setSuccess(isEditing ? "Add-on updated." : "Add-on created.");
      if (!isEditing) {
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} add-on.`);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (addon) => {
    setDeleteState({
      open: true,
      id: addon.id,
      label: addon.name || "this add-on",
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async () => {
    if (!deleteState.id) return;

    try {
      setSaving(true);
      setError("");
      await deleteAdminAddon(deleteState.id);
      await loadAddons();
      if (selectedId === deleteState.id) {
        resetForm();
      }
      setSuccess("Add-on deleted.");
      setDeleteState({ open: false, id: null, label: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete add-on.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Add-ons</h1>
            <p style={card.subtitle}>Create, edit, activate, and delete add-ons without being limited to the default inventory set.</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button type="button" onClick={handleEnsureDefaults} style={{ ...button.secondary, display: "inline-flex", alignItems: "center", gap: "10px" }} disabled={saving}>
              <RefreshCw size={16} />
              Ensure defaults
            </button>
            <button type="button" onClick={resetForm} style={{ ...button.primary, display: "inline-flex", alignItems: "center", gap: "10px" }}>
              <Plus size={16} />
              New add-on
            </button>
          </div>
        </div>
      </section>

      <section style={grid.two}>
        <article style={card.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 style={card.title}>Inventory</h2>
              <p style={card.subtitle}>{addons.length} records</p>
            </div>
            <div style={badge("default")}>{loading ? "Loading" : "Ready"}</div>
          </div>

          {loading ? (
            <div style={emptyState}>Loading add-ons...</div>
          ) : addons.length === 0 ? (
            <div style={emptyState}>No add-ons found.</div>
          ) : (
            <div style={table.wrapper}>
              <table style={table.table}>
                <thead>
                  <tr>
                    <th style={table.headCell}>Name</th>
                    <th style={table.headCell}>Type</th>
                    <th style={table.headCell}>Stock</th>
                    <th style={table.headCell}>Price</th>
                    <th style={table.headCell}>Status</th>
                    <th style={table.headCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {addons.map((addon) => (
                    <tr key={addon.id}>
                      <td style={table.cell}>
                        <div style={{ fontWeight: 700 }}>{addon.name}</div>
                        <div style={{ color: palette.muted, fontSize: "0.84rem", marginTop: "4px" }}>
                          {addon.description || "No description"}
                        </div>
                      </td>
                      <td style={table.cell}>{addon.type || "ONE_TIME"}</td>
                      <td style={table.cell}>{addon.quantity ?? 0}</td>
                      <td style={table.cell}>{formatCurrencyAmount(addon.price, tenantSettings)}</td>
                      <td style={table.cell}>
                        <span style={badge(addon.isActive ? "success" : "danger")}>
                          {addon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={table.cell}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button type="button" style={button.ghost} onClick={() => handleSelect(addon)}>
                            Edit
                          </button>
                          <button type="button" style={button.danger} onClick={() => openDeleteModal(addon)}>
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
          <h2 style={card.title}>{isEditing ? "Edit Add-on" : "Create Add-on"}</h2>
          <p style={card.subtitle}>
            {isEditing
              ? "Update pricing, stock, status, or description for the selected add-on."
              : "Create a new add-on that admins can attach to future bookings."}
          </p>

          {error && <div style={{ ...badge("danger"), marginTop: "16px", justifyContent: "center" }}>{error}</div>}
          {success && <div style={{ ...badge("success"), marginTop: "16px", justifyContent: "center" }}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ ...form.stack, marginTop: "18px" }}>
            <div style={form.field}>
              <label style={form.label}>Name</label>
              <input style={form.input} value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required />
            </div>

            <div style={form.field}>
              <label style={form.label}>Description</label>
              <textarea style={form.textarea} value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} />
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Price</label>
                <input style={form.input} type="number" min="0" step="0.01" value={formData.price} onChange={(event) => setFormData({ ...formData, price: event.target.value })} required />
              </div>
              <div style={form.field}>
                <label style={form.label}>Available quantity</label>
                <input style={form.input} type="number" min="0" step="1" value={formData.quantity} onChange={(event) => setFormData({ ...formData, quantity: event.target.value })} required />
              </div>
            </div>

            <div style={form.field}>
              <label style={form.label}>Type</label>
              <select style={form.input} value={formData.type} onChange={(event) => setFormData({ ...formData, type: event.target.value })}>
                <option value="ONE_TIME">ONE_TIME</option>
                <option value="DAILY">DAILY</option>
              </select>
            </div>

            <label style={{ ...form.label, display: "flex", alignItems: "center", gap: "10px", color: palette.text }}>
              <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })} />
              Add-on is active
            </label>

            <div style={form.actions}>
              <button type="submit" style={button.primary} disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Save Add-on" : "Create Add-on"}
              </button>
              <button type="button" style={button.secondary} onClick={resetForm} disabled={saving}>
                Reset
              </button>
              {isEditing ? (
                <button type="button" style={{ ...button.danger, display: "inline-flex", alignItems: "center", gap: "8px" }} onClick={() => openDeleteModal(selectedAddon)} disabled={saving}>
                  <Trash2 size={16} />
                  Delete
                </button>
              ) : null}
            </div>
          </form>
        </article>
      </section>

      <AdminConfirmModal
        open={deleteState.open}
        title="Delete this add-on?"
        description={`This will permanently remove ${deleteState.label}. Existing booking snapshots will stay intact, but the add-on will no longer be available.`}
        error={error}
        confirmLabel="Delete add-on"
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteState({ open: false, id: null, label: "" })}
      />
    </div>
  );
}
