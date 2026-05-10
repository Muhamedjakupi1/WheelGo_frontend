import { useEffect } from "react";
import { badge, button, palette } from "./adminStyles";

const panelStyle = {
  background: `linear-gradient(180deg, #121b2d, #0f1727)`,
  border: `1px solid ${palette.border}`,
  borderRadius: "20px",
  padding: "24px",
  maxWidth: "420px",
  width: "100%",
  boxShadow: "0 24px 56px rgba(0,0,0,0.45)",
};

/**
 * Accessible confirm dialog for destructive admin actions (replaces window.confirm).
 */
export default function AdminConfirmModal({
  open,
  title,
  description,
  error,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape" && !loading) onCancel?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, loading, onCancel]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.68)",
        padding: "24px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel?.();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" style={panelStyle}>
        <h2 id="admin-confirm-title" style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: palette.text }}>
          {title}
        </h2>
        {description && (
          <p style={{ margin: "12px 0 0", color: palette.muted, fontSize: "0.96rem", lineHeight: 1.55 }}>{description}</p>
        )}
        {error && (
          <div style={{ ...badge("danger"), marginTop: "16px", justifyContent: "flex-start", width: "100%" }}>{error}</div>
        )}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "22px", justifyContent: "flex-end" }}>
          <button type="button" style={button.secondary} onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" style={button.danger} onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
