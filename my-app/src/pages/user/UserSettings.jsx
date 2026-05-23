import React, { useState } from "react";
import { Lock, Bell, Shield } from "lucide-react";
import { updateMySettingsPassword } from "../../api/userSettingsApi";
import { useIsCompactLayout } from "../../hooks/useIsCompactLayout";
import {
  isValidPassword,
  PASSWORD_RULE_MESSAGE,
} from "../../utils/passwordValidation";

export default function TenantUserSettings() {
  const isCompact = useIsCompactLayout(760);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all password fields." });
      return;
    }

    if(form.currentPassword == form.newPassword){
      setMessage({type: "error", text: "The new passowrd cannot be the same as the old one."});
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "New password and confirm password do not match." });
      return;
    }

    if (!isValidPassword(form.newPassword)) {
      setMessage({ type: "error", text: PASSWORD_RULE_MESSAGE });
      return;
    }

    setSaving(true);

    try {
      await updateMySettingsPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage({ type: "success", text: "Password changed successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to change password.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ ...s.mainContent, ...(isCompact ? s.mainContentCompact : {}) }}>
      <header style={{ ...s.header, ...(isCompact ? s.headerCompact : {}) }}>
        <h1 style={s.title}>Settings</h1>
        <p style={s.subtitle}>Manage your account settings and preferences</p>
      </header>

      <div style={{ ...s.wrapper, ...(isCompact ? s.wrapperCompact : {}) }}>
        <section style={{ ...s.card, ...(isCompact ? s.cardCompact : {}) }}>
          <div style={s.cardHeader}>
            <Lock size={22} color="#ef4444" />
            <h2 style={s.cardTitle}>Security</h2>
          </div>

          {message.text ? (
            <div style={message.type === "success" ? s.successMessage : s.errorMessage}>{message.text}</div>
          ) : null}

          <form style={s.cardBody} onSubmit={handleSubmit}>
            <div style={s.inputGroup}>
              <label style={s.label}>Current Password</label>
              <input
                type="password"
                placeholder="Current password"
                style={s.input}
                value={form.currentPassword}
                onChange={(e) => handleChange("currentPassword", e.target.value)}
                disabled={saving}
              />
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>New Password</label>
              <input
                type="password"
                placeholder="New password"
                style={s.input}
                value={form.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                disabled={saving}
              />
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                style={s.input}
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                disabled={saving}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Changing..." : "Change Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

const SettingsOption = ({ icon, title, desc, active }) => (
  <div style={s.optionRow}>
    <div style={s.optionInfo}>
      <div style={s.optionIcon}>{icon}</div>
      <div>
        <div style={s.optionTitle}>{title}</div>
        <div style={s.optionDesc}>{desc}</div>
      </div>
    </div>
    <div style={{ ...s.toggle, background: active ? "#3b82f6" : "#2d3748" }}>
      <div style={{ ...s.toggleCircle, transform: active ? "translateX(20px)" : "translateX(0)" }}></div>
    </div>
  </div>
);

const s = {
  mainContent: { width: "100%", color: "#fff" },
  mainContentCompact: { paddingBottom: "24px" },
  header: { marginBottom: "40px" },
  headerCompact: { marginBottom: "24px" },
  title: { fontSize: "32px", fontWeight: "700", margin: "0 0 10px 0" },
  subtitle: { color: "#94a3b8", fontSize: "16px" },
  wrapper: { display: "flex", flexDirection: "column", gap: "34px" },
  wrapperCompact: { gap: "20px" },
  card: { background: "#0f172a", borderRadius: "24px", border: "1px solid #1e293b", padding: "30px" },
  preferencesCard: { background: "#0f172a", borderRadius: "24px", border: "1px solid #1e293b", padding: "30px", marginTop: "8px" },
  cardCompact: { padding: "20px 16px" },
  cardHeader: { display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" },
  cardTitle: { fontSize: "20px", fontWeight: "600", margin: 0 },
  cardBody: { display: "flex", flexDirection: "column", gap: "20px" },
  successMessage: {
    marginBottom: "18px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #14532d",
    background: "rgba(20, 83, 45, 0.25)",
    color: "#bbf7d0",
    fontSize: "14px",
  },
  errorMessage: {
    marginBottom: "18px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #7f1d1d",
    background: "rgba(127, 29, 29, 0.25)",
    color: "#fecaca",
    fontSize: "14px",
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", color: "#94a3b8", fontWeight: "500" },
  input: {
    background: "#161f2e",
    border: "1px solid #2d3748",
    borderRadius: "12px",
    padding: "12px 15px",
    color: "#fff",
    outline: "none",
    fontSize: "15px",
  },
  saveBtn: {
    background: "#1e293b",
    color: "#fff",
    border: "1px solid #334155",
    padding: "12px",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    transition: "0.2s",
  },
  optionsList: { display: "flex", flexDirection: "column", gap: "15px" },
  optionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    background: "#161f2e",
    borderRadius: "16px",
    border: "1px solid #2d3748",
    gap: "12px",
    flexWrap: "wrap",
  },
  optionInfo: { display: "flex", alignItems: "center", gap: "15px" },
  optionIcon: { color: "#94a3b8" },
  optionTitle: { fontWeight: "600", fontSize: "16px" },
  optionDesc: { fontSize: "13px", color: "#64748b" },
  toggle: { width: "44px", height: "24px", borderRadius: "20px", padding: "2px", cursor: "pointer", transition: "0.3s" },
  toggleCircle: { width: "20px", height: "20px", background: "#fff", borderRadius: "50%", transition: "0.3s" },
};
