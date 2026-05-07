import React from "react";
import { User, Lock, Bell, Shield, Moon, Globe } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function TenantUserSettings() {
  const { user } = useAuth();

  return (
    <div style={s.mainContent}>
      <header style={s.header}>
        <h1 style={s.title}>Settings</h1>
        <p style={s.subtitle}>Manage your account settings and preferences</p>
      </header>

      <div style={s.settingsGrid}>
        {/* SEKSIONI I PROFILIT */}
        <section style={s.card}>
          <div style={s.cardHeader}>
            <User size={22} color="#3b82f6" />
            <h2 style={s.cardTitle}>Profile Information</h2>
          </div>
          <div style={s.cardBody}>
            <div style={s.inputGroup}>
              <label style={s.label}>Full Name</label>
              <input type="text" defaultValue="Floyd Miles" style={s.input} />
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Email Address</label>
              <input type="email" defaultValue={user?.email} style={s.input} />
            </div>
            <button style={s.saveBtn}>Update Profile</button>
          </div>
        </section>

        {/* SEKSIONI I SIGURISË */}
        <section style={s.card}>
          <div style={s.cardHeader}>
            <Lock size={22} color="#ef4444" />
            <h2 style={s.cardTitle}>Security</h2>
          </div>
          <div style={s.cardBody}>
            <div style={s.inputGroup}>
              <label style={s.label}>Current Password</label>
              <input type="password" placeholder="••••••••" style={s.input} />
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>New Password</label>
              <input type="password" placeholder="New password" style={s.input} />
            </div>
            <button style={{...s.saveBtn, background: '#1e293b', border: '1px solid #334155'}}>Change Password</button>
          </div>
        </section>

        {/* PREFERENCAT */}
        <section style={s.cardFull}>
          <div style={s.cardHeader}>
            <Bell size={22} color="#f59e0b" />
            <h2 style={s.cardTitle}>Preferences & Notifications</h2>
          </div>
          <div style={s.optionsList}>
            <SettingsOption 
              icon={<Bell size={20}/>} 
              title="Email Notifications" 
              desc="Receive updates about your bookings via email"
              active={true}
            />
            <SettingsOption 
              icon={<Shield size={20}/>} 
              title="Two-Factor Authentication" 
              desc="Add an extra layer of security to your account"
              active={false}
            />
            <SettingsOption 
              icon={<Globe size={20}/>} 
              title="Public Profile" 
              desc="Make your profile visible to other users"
              active={true}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// Komponent i vogël për rreshtat e opsioneve
const SettingsOption = ({ icon, title, desc, active }) => (
  <div style={s.optionRow}>
    <div style={s.optionInfo}>
      <div style={s.optionIcon}>{icon}</div>
      <div>
        <div style={s.optionTitle}>{title}</div>
        <div style={s.optionDesc}>{desc}</div>
      </div>
    </div>
    <div style={{...s.toggle, background: active ? '#3b82f6' : '#2d3748'}}>
      <div style={{...s.toggleCircle, transform: active ? 'translateX(20px)' : 'translateX(0)'}}></div>
    </div>
  </div>
);

const s = {
  mainContent: { width: "100%", color: "#fff" },
  header: { marginBottom: "40px" },
  title: { fontSize: "32px", fontWeight: "700", margin: "0 0 10px 0" },
  subtitle: { color: "#94a3b8", fontSize: "16px" },
  settingsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" },
  card: { background: "#0f172a", borderRadius: "24px", border: "1px solid #1e293b", padding: "30px" },
  cardFull: { background: "#0f172a", borderRadius: "24px", border: "1px solid #1e293b", padding: "30px", gridColumn: "span 2" },
  cardHeader: { display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" },
  cardTitle: { fontSize: "20px", fontWeight: "600", margin: 0 },
  cardBody: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", color: "#94a3b8", fontWeight: "500" },
  input: { 
    background: "#161f2e", 
    border: "1px solid #2d3748", 
    borderRadius: "12px", 
    padding: "12px 15px", 
    color: "#fff",
    outline: "none",
    fontSize: "15px"
  },
  saveBtn: { 
    background: "#3b82f6", 
    color: "#fff", 
    border: "none", 
    padding: "12px", 
    borderRadius: "12px", 
    fontWeight: "600", 
    cursor: "pointer",
    marginTop: "10px",
    transition: "0.2s"
  },
  optionsList: { display: "flex", flexDirection: "column", gap: "15px" },
  optionRow: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "15px", 
    background: "#161f2e", 
    borderRadius: "16px",
    border: "1px solid #2d3748"
  },
  optionInfo: { display: "flex", alignItems: "center", gap: "15px" },
  optionIcon: { color: "#94a3b8" },
  optionTitle: { fontWeight: "600", fontSize: "16px" },
  optionDesc: { fontSize: "13px", color: "#64748b" },
  toggle: { width: "44px", height: "24px", borderRadius: "20px", padding: "2px", cursor: "pointer", transition: "0.3s" },
  toggleCircle: { width: "20px", height: "20px", background: "#fff", borderRadius: "50%", transition: "0.3s" }
};