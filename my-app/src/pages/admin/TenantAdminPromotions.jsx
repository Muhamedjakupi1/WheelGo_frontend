import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createAdminPromotion,
  deleteAdminPromotion,
  getAdminPromotions,
  updateAdminPromotion,
} from "../../api/adminApi";
import { useTenantSettings } from "../../context/TenantSettingsContext";
import { formatCurrencyAmount } from "../../utils/currency";
import AdminConfirmModal from "./AdminConfirmModal";
import { badge, button, card, emptyState, form, getReadHeavyTwoColumnLayout, layout, palette, table } from "./adminStyles";
import { useIsCompactLayout } from "../../hooks/useIsCompactLayout";

const defaultForm = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  maxUses: "",
  validFrom: "",
  validUntil: "",
  isActive: true,
};

export default function TenantAdminPromotions() {
  const { settings: tenantSettings } = useTenantSettings();
  const isCompact = useIsCompactLayout(1100);
  const isWide = useIsCompactLayout(1500);
  const workspaceGrid = getReadHeavyTwoColumnLayout(isCompact, isWide);
  const [promotions, setPromotions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteState, setDeleteState] = useState({ open: false, id: null, label: "" });

  const selectedPromotion = useMemo(
    () => promotions.find((promotion) => promotion.id === selectedId) || null,
    [promotions, selectedId]
  );
  const isEditing = Boolean(selectedPromotion);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminPromotions();
      setPromotions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load promotions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const resetForm = () => {
    setSelectedId(null);
    setFormData(defaultForm);
    setError("");
    setSuccess("");
  };

  const handleSelect = (promotion) => {
    setSelectedId(promotion.id);
    setFormData({
      code: promotion.code || "",
      discountType: promotion.discountType || "PERCENTAGE",
      discountValue: promotion.discountValue ?? "",
      maxUses: promotion.maxUses ?? "",
      validFrom: toDateTimeInput(promotion.validFrom),
      validUntil: toDateTimeInput(promotion.validUntil),
      isActive: promotion.isActive ?? true,
    });
    setError("");
    setSuccess("");
  };

  const buildPayload = () => ({
    code: formData.code.trim(),
    discountType: formData.discountType,
    discountValue: Number(formData.discountValue || 0),
    maxUses: formData.maxUses === "" ? null : Number(formData.maxUses),
    validFrom: formData.validFrom ? `${formData.validFrom}:00` : null,
    validUntil: formData.validUntil ? `${formData.validUntil}:00` : null,
    isActive: formData.isActive,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      if (isEditing) {
        await updateAdminPromotion(selectedId, buildPayload());
      } else {
        await createAdminPromotion(buildPayload());
      }
      await loadPromotions();
      setSuccess(isEditing ? "Promotion updated." : "Promotion created.");
      if (!isEditing) resetForm();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} promotion.`);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (promotion) => {
    setDeleteState({ open: true, id: promotion.id, label: promotion.code || "this promotion" });
    setError("");
    setSuccess("");
  };

  const handleDelete = async () => {
    if (!deleteState.id) return;
    try {
      setSaving(true);
      setError("");
      await deleteAdminPromotion(deleteState.id);
      await loadPromotions();
      if (selectedId === deleteState.id) resetForm();
      setSuccess("Promotion deleted.");
      setDeleteState({ open: false, id: null, label: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete promotion.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Promotions</h1>
            <p style={card.subtitle}>Create discount codes users can enter before paying for a booking.</p>
          </div>
          <button type="button" onClick={resetForm} style={{ ...button.primary, display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <Plus size={16} />
            New promotion
          </button>
        </div>
      </section>

      <section style={workspaceGrid}>
        <article style={card.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 style={card.title}>Codes</h2>
              <p style={card.subtitle}>{promotions.length} records</p>
            </div>
            <div style={badge("default")}>{loading ? "Loading" : "Ready"}</div>
          </div>

          {loading ? (
            <div style={emptyState}>Loading promotions...</div>
          ) : promotions.length === 0 ? (
            <div style={emptyState}>No promotions found.</div>
          ) : (
            <div style={table.wrapper}>
              <table style={table.table}>
                <thead>
                  <tr>
                    <th style={table.headCell}>Code</th>
                    <th style={table.headCell}>Discount</th>
                    <th style={table.headCell}>Usage</th>
                    <th style={table.headCell}>Status</th>
                    <th style={table.headCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promotion) => (
                    <tr key={promotion.id}>
                      <td style={table.cell}>
                        <div style={{ fontWeight: 800 }}>{promotion.code}</div>
                        <div style={{ color: palette.muted, fontSize: "0.84rem", marginTop: "4px" }}>
                          {formatDateRange(promotion.validFrom, promotion.validUntil)}
                        </div>
                      </td>
                      <td style={table.cell}>{formatDiscount(promotion, tenantSettings)}</td>
                      <td style={table.cell}>{promotion.usesCount ?? 0}{promotion.maxUses ? ` / ${promotion.maxUses}` : ""}</td>
                      <td style={table.cell}>
                        <span style={badge(promotion.isActive ? "success" : "danger")}>
                          {promotion.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={table.cell}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button type="button" style={button.ghost} onClick={() => handleSelect(promotion)}>
                            Edit
                          </button>
                          <button type="button" style={button.danger} onClick={() => openDeleteModal(promotion)}>
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
          <h2 style={card.title}>{isEditing ? "Edit Promotion" : "Create Promotion"}</h2>
          <p style={card.subtitle}>
            Example: code WheelGo-10 with a percentage value of 10 gives users 10% off at payment.
          </p>

          {error && <div style={{ ...badge("danger"), marginTop: "16px", justifyContent: "center" }}>{error}</div>}
          {success && <div style={{ ...badge("success"), marginTop: "16px", justifyContent: "center" }}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ ...form.stack, marginTop: "18px" }}>
            <div style={form.field}>
              <label style={form.label}>Code</label>
              <input style={form.input} value={formData.code} onChange={(event) => setFormData({ ...formData, code: event.target.value })} placeholder="WheelGo-10" required />
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Discount type</label>
                <select style={form.input} value={formData.discountType} onChange={(event) => setFormData({ ...formData, discountType: event.target.value })}>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed amount</option>
                </select>
              </div>
              <div style={form.field}>
                <label style={form.label}>Discount value</label>
                <input style={form.input} type="number" min="0.01" step="0.01" value={formData.discountValue} onChange={(event) => setFormData({ ...formData, discountValue: event.target.value })} required />
              </div>
            </div>

            <div style={form.row}>
              <div style={form.field}>
                <label style={form.label}>Valid from</label>
                <input style={form.input} type="datetime-local" value={formData.validFrom} onChange={(event) => setFormData({ ...formData, validFrom: event.target.value })} />
              </div>
              <div style={form.field}>
                <label style={form.label}>Valid until</label>
                <input style={form.input} type="datetime-local" value={formData.validUntil} onChange={(event) => setFormData({ ...formData, validUntil: event.target.value })} />
              </div>
            </div>

            <div style={form.field}>
              <label style={form.label}>Max uses</label>
              <input style={form.input} type="number" min="1" step="1" value={formData.maxUses} onChange={(event) => setFormData({ ...formData, maxUses: event.target.value })} placeholder="Unlimited" />
            </div>

            <label style={{ ...form.label, display: "flex", alignItems: "center", gap: "10px", color: palette.text }}>
              <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })} />
              Promotion is active
            </label>

            <div style={form.actions}>
              <button type="submit" style={button.primary} disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Save Promotion" : "Create Promotion"}
              </button>
              <button type="button" style={button.secondary} onClick={resetForm} disabled={saving}>
                Reset
              </button>
              {isEditing ? (
                <button type="button" style={{ ...button.danger, display: "inline-flex", alignItems: "center", gap: "8px" }} onClick={() => openDeleteModal(selectedPromotion)} disabled={saving}>
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
        title="Delete this promotion?"
        description={`This removes ${deleteState.label}. Existing bookings that already used it keep their discount.`}
        error={error}
        confirmLabel="Delete promotion"
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteState({ open: false, id: null, label: "" })}
      />
    </div>
  );
}

function formatDiscount(promotion, tenantSettings) {
  if (promotion.discountType === "FIXED") {
    return formatCurrencyAmount(promotion.discountValue, tenantSettings);
  }
  return `${promotion.discountValue}%`;
}

function formatDateRange(validFrom, validUntil) {
  if (!validFrom && !validUntil) return "No date window";
  return `${formatDate(validFrom) || "Now"} - ${formatDate(validUntil) || "No end"}`;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeInput(value) {
  if (!value) return "";
  return value.slice(0, 16);
}
