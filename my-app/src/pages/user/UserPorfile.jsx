import React, { useEffect, useState } from "react";
import { User, Mail, MapPin, Calendar, Car, Star, Edit3, Camera, Save, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMyProfile, updateMyProfile } from "../../api/userProfileApi";

const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  avatarUrl: "",
  dateOfBirth: "",
  address: "",
  city: "",
  country: "",
};

export default function TenantUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await getMyProfile();
      applyProfile(data);
      setError("");
    } catch (err) {
      console.error("Failed to load profile", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const applyProfile = (data) => {
    setProfile(data);
    setForm({
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      phone: data?.phone || "",
      avatarUrl: data?.avatarUrl || "",
      dateOfBirth: data?.dateOfBirth || "",
      address: data?.address || "",
      city: data?.city || "",
      country: data?.country || "",
    });
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleEdit = () => {
    setEditing(true);
    setSuccess("");
    setError("");
  };

  const handleCancel = () => {
    if (profile) {
      applyProfile(profile);
    }
    setEditing(false);
    setSuccess("");
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone,
        avatarUrl: form.avatarUrl,
        dateOfBirth: form.dateOfBirth || null,
        address: form.address,
        city: form.city,
        country: form.country,
      };

      const { data } = await updateMyProfile(payload);
      applyProfile(data);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const fullName =
    profile && (profile.firstName || profile.lastName)
      ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
      : "User";

  const location =
    profile && (profile.city || profile.country)
      ? [profile.city, profile.country].filter(Boolean).join(", ")
      : "-";

  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : "-";

  if (loading) {
    return <div style={s.mainContent}>Loading profile...</div>;
  }

  if (error && !profile) {
    return <div style={s.mainContent}>{error}</div>;
  }

  return (
    <div style={s.mainContent}>
      <header style={s.profileHeader}>
        <div style={s.coverImage}></div>
        <div style={s.profileInfoSection}>
          <div style={s.avatarWrapper}>
            <img
              src={profile?.avatarUrl || form.avatarUrl || "https://i.pravatar.cc/150?u=floyd"}
              alt="Profile"
              style={s.largeAvatar}
            />
            <div style={s.editAvatarBtn}><Camera size={16} /></div>
          </div>
          <div style={s.userMeta}>
            <h1 style={s.userName}>{fullName}</h1>
            {success ? <p style={s.successText}>{success}</p> : null}
            {error ? <p style={s.errorText}>{error}</p> : null}
          </div>
          {editing ? (
            <div style={s.actionGroup}>
              <button style={s.secondaryBtn} onClick={handleCancel} type="button" disabled={saving}>
                <X size={18} /> Cancel
              </button>
              <button style={s.primaryBtn} onClick={handleSave} type="button" disabled={saving}>
                <Save size={18} /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button style={s.editProfileBtn} onClick={handleEdit} type="button">
              <Edit3 size={18} /> Edit Profile
            </button>
          )}
        </div>
      </header>

      <div style={s.profileGrid}>
        <div style={s.statsContainer}>
          <StatCard icon={<Car size={20} color="#3b82f6" />} label="Total Rides" value="0" />
          <StatCard icon={<Calendar size={20} color="#10b981" />} label="Member Since" value={memberSince} />
          <StatCard icon={<Star size={20} color="#f59e0b" />} label="User Rating" value="-" />
        </div>

        <section style={s.card}>
          <h2 style={s.cardTitle}>Contact Details</h2>
          {editing ? (
            <div style={s.formGrid}>
              <FormField label="First Name" value={form.firstName} onChange={(value) => handleChange("firstName", value)} />
              <FormField label="Last Name" value={form.lastName} onChange={(value) => handleChange("lastName", value)} />
              <StaticField label="Email" value={user?.email || "-"} />
              <FormField label="Phone" value={form.phone} onChange={(value) => handleChange("phone", value)} />
              <FormField label="Avatar URL" value={form.avatarUrl} onChange={(value) => handleChange("avatarUrl", value)} />
            </div>
          ) : (
            <div style={s.infoList}>
              <InfoRow icon={<Mail size={18} />} label="Email" value={user?.email || "-"} />
              <InfoRow icon={<User size={18} />} label="Full Name" value={fullName} />
              <InfoRow icon={<MapPin size={18} />} label="Location" value={location} />
              <InfoRow icon={<MapPin size={18} />} label="Phone" value={profile?.phone || "-"} />
            </div>
          )}
        </section>

        <section style={s.card}>
          <h2 style={s.cardTitle}>Profile Details</h2>
          {editing ? (
            <div style={s.formGrid}>
              <FormField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(value) => handleChange("dateOfBirth", value)} />
              <FormField label="Address" value={form.address} onChange={(value) => handleChange("address", value)} />
              <FormField label="City" value={form.city} onChange={(value) => handleChange("city", value)} />
              <FormField label="Country" value={form.country} onChange={(value) => handleChange("country", value)} />
            </div>
          ) : (
            <div style={s.infoList}>
              <InfoRow icon={<Calendar size={18} />} label="Date of Birth" value={profile?.dateOfBirth || "-"} />
              <InfoRow icon={<MapPin size={18} />} label="Address" value={profile?.address || "-"} />
              <InfoRow icon={<MapPin size={18} />} label="City" value={profile?.city || "-"} />
              <InfoRow icon={<MapPin size={18} />} label="Country" value={profile?.country || "-"} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value }) => (
  <div style={s.statCard}>
    <div style={s.statIcon}>{icon}</div>
    <div>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div style={s.infoRow}>
    <div style={s.infoLabelWrapper}>
      {icon} <span style={{ marginLeft: 10 }}>{label}:</span>
    </div>
    <span style={s.infoValue}>{value}</span>
  </div>
);

const FormField = ({ label, value, onChange, type = "text" }) => (
  <label style={s.fieldGroup}>
    <span style={s.fieldLabel}>{label}</span>
    <input style={s.input} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
  </label>
);

const StaticField = ({ label, value }) => (
  <div style={s.fieldGroup}>
    <span style={s.fieldLabel}>{label}</span>
    <div style={s.staticValue}>{value}</div>
  </div>
);

const s = {
  mainContent: { width: "100%", color: "#fff" },
  profileHeader: {
    background: "#0f172a",
    borderRadius: "28px",
    overflow: "hidden",
    border: "1px solid #1e293b",
    marginBottom: "30px"
  },
  coverImage: {
    height: "160px",
    background: "linear-gradient(90deg, #1e293b 0%, #3b82f6 100%)",
    opacity: 0.8
  },
  profileInfoSection: {
    padding: "0 40px 30px 40px",
    display: "flex",
    alignItems: "flex-end",
    marginTop: "-50px",
    gap: "25px",
    position: "relative"
  },
  avatarWrapper: { position: "relative" },
  largeAvatar: {
    width: "120px",
    height: "120px",
    borderRadius: "30px",
    border: "5px solid #080a0f",
    objectFit: "cover",
    background: "#080a0f"
  },
  editAvatarBtn: {
    position: "absolute", bottom: "5px", right: "5px",
    background: "#3b82f6", padding: "8px", borderRadius: "10px",
    cursor: "pointer", border: "3px solid #080a0f"
  },
  userMeta: { flex: 1, paddingBottom: "10px" },
  userName: { fontSize: "28px", fontWeight: "700", margin: 0 },
  editProfileBtn: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "transparent", border: "1px solid #334155",
    color: "#fff", padding: "10px 20px", borderRadius: "12px",
    cursor: "pointer", fontWeight: "600", marginBottom: "10px"
  },
  actionGroup: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px"
  },
  primaryBtn: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "#2563eb", border: "none",
    color: "#fff", padding: "10px 20px", borderRadius: "12px",
    cursor: "pointer", fontWeight: "600"
  },
  secondaryBtn: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "transparent", border: "1px solid #334155",
    color: "#fff", padding: "10px 20px", borderRadius: "12px",
    cursor: "pointer", fontWeight: "600"
  },
  successText: { color: "#34d399", margin: "8px 0 0 0", fontSize: "14px" },
  errorText: { color: "#f87171", margin: "8px 0 0 0", fontSize: "14px" },
  profileGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" },
  statsContainer: { gridColumn: "span 2", display: "flex", gap: "20px" },
  statCard: {
    flex: 1, background: "#0f172a", padding: "20px",
    borderRadius: "20px", border: "1px solid #1e293b",
    display: "flex", alignItems: "center", gap: "15px"
  },
  statIcon: { background: "#161f2e", padding: "12px", borderRadius: "15px" },
  statValue: { fontSize: "20px", fontWeight: "700" },
  statLabel: { fontSize: "13px", color: "#64748b" },
  card: { background: "#0f172a", padding: "30px", borderRadius: "24px", border: "1px solid #1e293b" },
  cardTitle: { fontSize: "20px", fontWeight: "600", marginBottom: "25px" },
  infoList: { display: "flex", flexDirection: "column", gap: "20px" },
  infoRow: { display: "flex", justifyContent: "space-between", borderBottom: "1px solid #161f2e", paddingBottom: "15px" },
  infoLabelWrapper: { color: "#94a3b8", display: "flex", alignItems: "center" },
  infoValue: { fontWeight: "500" },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px"
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  fieldLabel: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 600
  },
  input: {
    background: "#111827",
    border: "1px solid #334155",
    color: "#fff",
    borderRadius: "12px",
    padding: "12px 14px",
    outline: "none"
  },
  staticValue: {
    background: "#111827",
    border: "1px solid #1f2937",
    color: "#cbd5e1",
    borderRadius: "12px",
    padding: "12px 14px",
    minHeight: "44px",
    display: "flex",
    alignItems: "center"
  }
};
