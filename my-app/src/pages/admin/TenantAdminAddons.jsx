import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  ensureAdminDefaultAddons,
  getAdminAddons,
  updateAdminAddon,
} from "../../api/adminApi";
import { badge, button, card, emptyState, form, grid, layout, palette, table } from "./adminStyles";

const defaultForm = {
  name: "",
  description: "",
  price: "",
  quantity: "",
  isActive: true,
};

const managedNames = new Set(["baby seat", "bluetooth"]);

export default function TenantAdminAddons() {
  const [addons, setAddons] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedAddon = useMemo(
    () => addons.find((addon) => addon.id === selectedId) || addons.find((addon) => managedNames.has((addon.name || "").toLowerCase())) || addons[0],
    [addons, selectedId]
  );

  const loadAddons = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminAddons();
      setAddons(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load add-ons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddons();
  }, []);

  useEffect(() => {
    if (!selectedAddon) return;
    setSelectedId(selectedAddon.id);
    setFormData({
      name: selectedAddon.name || "",
      description: selectedAddon.description || "",
      price: selectedAddon.price ?? "",
      quantity: selectedAddon.quantity ?? 0,
      isActive: selectedAddon.isActive ?? true,
    });
  }, [selectedAddon?.id]);

  const handleEnsureDefaults = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const response = await ensureAdminDefaultAddons();
      setAddons(response.data || []);
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
      isActive: addon.isActive ?? true,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedId) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await updateAdminAddon(selectedId, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: Number(formData.price || 0),
        quantity: Number(formData.quantity || 0),
        type: "ONE_TIME",
        isActive: formData.isActive,
      });
      await loadAddons();
      setSuccess("Add-on updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update add-on.");
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
            <p style={card.subtitle}>Set prices and available stock for Baby Seat and Bluetooth inventory.</p>
          </div>
          <button type="button" onClick={handleEnsureDefaults} style={{ ...button.secondary, display: "inline-flex", alignItems: "center", gap: "10px" }} disabled={saving}>
            <RefreshCw size={16} />
            Ensure defaults
          </button>
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
                      <td style={table.cell}>{addon.quantity ?? 0}</td>
                      <td style={table.cell}>€{Number(addon.price || 0).toFixed(2)}</td>
                      <td style={table.cell}>
                        <span style={badge(addon.isActive ? "success" : "danger")}>
                          {addon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={table.cell}>
                        <button type="button" style={button.ghost} onClick={() => handleSelect(addon)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article style={card.panel}>
          <h2 style={card.title}>Edit Add-on</h2>
          <p style={card.subtitle}>Quantity is reduced when a booking is saved and restored when it finishes or is rejected.</p>

          {error && <div style={{ ...badge("danger"), marginTop: "16px", justifyContent: "center" }}>{error}</div>}
          {success && <div style={{ ...badge("success"), marginTop: "16px", justifyContent: "center" }}>{success}</div>}

          {selectedAddon ? (
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

              <label style={{ ...form.label, display: "flex", alignItems: "center", gap: "10px", color: palette.text }}>
                <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })} />
                Add-on is active
              </label>

              <div style={form.actions}>
                <button type="submit" style={button.primary} disabled={saving}>
                  {saving ? "Saving..." : "Save Add-on"}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ ...emptyState, marginTop: "18px" }}>Select an add-on.</div>
          )}
        </article>
      </section>
    </div>
  );
}
