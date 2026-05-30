import React, { useEffect, useState } from "react";
import { User, Mail, MapPin, Calendar, Car, Star, Edit3, Camera, Save, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useIsCompactLayout } from "../../hooks/useIsCompactLayout";
import { getMyProfile, updateMyProfile, uploadMyAvatar } from "../../api/userProfileApi";
import { getMyBookings } from "../../api/bookingApi";
import {
  getMyDriverLicense,
  verifyMyDriverLicense,
} from "../../api/driverLicenseApi";
import { resolveMediaUrl } from "../../utils/media";

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

const emptyLicenseForm = {
  licenseNumber: "",
  issuingCountry: "",
  expiryDate: "",
};

export default function TenantUserProfile() {
  const { user } = useAuth();
  const isCompact = useIsCompactLayout(960);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [license, setLicense] = useState(null);
  const [licenseForm, setLicenseForm] = useState(emptyLicenseForm);
  const [licenseFiles, setLicenseFiles] = useState({ front: null, back: null });
  const [licensePreviews, setLicensePreviews] = useState({ front: "", back: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [licenseVerifying, setLicenseVerifying] = useState(false);
  const [licenseMessage, setLicenseMessage] = useState({ type: "", text: "" });
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    loadProfile();
    // loadProfile is intentionally called once on mount to hydrate the profile form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const [{ data: profileData }, { data: licenseData }, { data: bookingsData }] = await Promise.all([
        getMyProfile(),
        getMyDriverLicense(),
        getMyBookings(),
      ]);
      applyProfile(profileData);
      applyLicense(licenseData);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
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

  const applyLicense = (data, syncForm = true) => {
    setLicense(data);
    if (syncForm) {
      setLicenseForm({
        licenseNumber: data?.licenseNumber || "",
        issuingCountry: data?.issuingCountry || "",
        expiryDate: data?.expiryDate || "",
      });
    }
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleLicenseChange = (field, value) => {
    setLicenseForm((current) => ({ ...current, [field]: value }));
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

  const handleAvatarUpload = async (file) => {
    if (!file || avatarUploading) return;

    setAvatarUploading(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await uploadMyAvatar(file);
      applyProfile(data);
      setSuccess("Profile photo updated.");
    } catch (err) {
      console.error("Failed to upload avatar", err);
      setError(readError(err, "Failed to upload profile photo."));
    } finally {
      setAvatarUploading(false);
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

  const memberSince = profile?.memberSince
    ? new Date(profile.memberSince).toLocaleDateString()
    : "-";
  const completedRideCount =
    typeof profile?.totalRides === "number"
      ? profile.totalRides
      : bookings.filter((booking) => booking?.status === "COMPLETED").length;
  const totalRides = String(completedRideCount);
  const userRating =
    typeof profile?.averageRating === "number" && Number.isFinite(profile.averageRating)
      ? profile.averageRating.toFixed(1)
      : "No rating yet";
  const licenseStatus = license?.verified ? "Verified" : "Pending verification";
  const avatarSrc =
    resolveMediaUrl(profile?.avatarUrl || form.avatarUrl) ||
    `https://i.pravatar.cc/150?u=${user?.email || "user"}`;

  const handleSelectLicenseImage = (side, file) => {
    if (!file) return;

    setLicenseFiles((current) => ({ ...current, [side]: file }));
    setLicensePreviews((current) => {
      if (current[side]) {
        URL.revokeObjectURL(current[side]);
      }
      return { ...current, [side]: URL.createObjectURL(file) };
    });
    setLicenseMessage({ type: "", text: "" });
    setVerification(null);
  };

  const handleVerifyLicense = async () => {
    if (!licenseForm.licenseNumber.trim() || !licenseForm.issuingCountry.trim() || !licenseForm.expiryDate) {
      setLicenseMessage({ type: "error", text: "Fill license number, issuing country, and expiry date before verification." });
      return;
    }
    if ((!licenseFiles.front && !license?.frontImageUrl) || (!licenseFiles.back && !license?.backImageUrl)) {
      setLicenseMessage({ type: "error", text: "Choose both front and back images before verification." });
      return;
    }

    setLicenseVerifying(true);
    setLicenseMessage({ type: "", text: "" });

    try {
      const payload = {
        licenseNumber: licenseForm.licenseNumber.trim(),
        issuingCountry: licenseForm.issuingCountry.trim(),
        expiryDate: licenseForm.expiryDate || null,
      };

      const { data } = await verifyMyDriverLicense(payload, licenseFiles);
      setVerification(data);
      applyLicense(data.license);
      setLicenseFiles({ front: null, back: null });
      setLicensePreviews({ front: "", back: "" });
      setLicenseMessage({
        type: data.verified ? "success" : "error",
        text: data.verified ? "AI and OCR verification passed and details were saved." : "AI and OCR verification failed. Details were saved, but the entered details do not match the photos.",
      });
    } catch (err) {
      console.error("Failed to verify driver license", err);
      setLicenseMessage({ type: "error", text: readError(err, "Failed to verify driver license.") });
    } finally {
      setLicenseVerifying(false);
    }
  };

  if (loading) {
    return <div style={s.mainContent}>Loading profile...</div>;
  }

  if (error && !profile) {
    return <div style={s.mainContent}>{error}</div>;
  }

  return (
    <div style={{ ...s.mainContent, ...(isCompact ? s.mainContentCompact : {}) }}>
      <header style={s.profileHeader}>
        <div style={s.coverImage}></div>
        <div style={{ ...s.profileInfoSection, ...(isCompact ? s.profileInfoSectionCompact : {}) }}>
          <div style={s.avatarWrapper}>
            <img
              src={avatarSrc}
              alt="Profile"
              style={s.largeAvatar}
            />
            <label style={s.editAvatarBtn} title="Change profile photo">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                disabled={avatarUploading}
                onChange={(event) => handleAvatarUpload(event.target.files?.[0] || null)}
              />
            </label>
          </div>
          <div style={s.userMeta}>
            <h1 style={s.userName}>{fullName}</h1>
            {avatarUploading ? <p style={s.successText}>Uploading profile photo...</p> : null}
            {success ? <p style={s.successText}>{success}</p> : null}
            {error ? <p style={s.errorText}>{error}</p> : null}
          </div>
          {editing ? (
            <div style={{ ...s.actionGroup, ...(isCompact ? s.actionGroupCompact : {}) }}>
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

      <div style={{ ...s.profileGrid, ...(isCompact ? s.profileGridCompact : {}) }}>
        <div style={{ ...s.statsContainer, ...(isCompact ? s.statsContainerCompact : {}) }}>
          <StatCard icon={<Car size={20} color="#3b82f6" />} label="Total Rides" value={totalRides} />
          <StatCard icon={<Calendar size={20} color="#10b981" />} label="Member Since" value={memberSince} />
          <StatCard icon={<Star size={20} color="#f59e0b" />} label="User Rating" value={userRating} />
        </div>

        <section style={s.card}>
          <h2 style={s.cardTitle}>Contact Details</h2>
          {editing ? (
            <div style={s.formGrid}>
              <FormField label="First Name" value={form.firstName} onChange={(value) => handleChange("firstName", value)} />
              <FormField label="Last Name" value={form.lastName} onChange={(value) => handleChange("lastName", value)} />
              <StaticField label="Email" value={user?.email || "-"} />
              <FormField label="Phone" value={form.phone} onChange={(value) => handleChange("phone", value)} />
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

        <section style={{ ...s.card, ...(!isCompact ? s.licenseCardWide : s.licenseCardCompact) }}>
          <div style={{ ...s.licenseHeader, ...(isCompact ? s.licenseHeaderCompact : {}) }}>
            <div>
              <h2 style={s.cardTitle}>Driver License Verification</h2>
              <p style={s.licenseSubtitle}>
                Enter the license details, choose both sides, then verify. Everything is saved during AI and OCR verification.
              </p>
            </div>
            <span style={license?.verified ? s.verifiedBadge : s.pendingBadge}>{licenseStatus}</span>
          </div>

          {licenseMessage.text ? (
            <div style={licenseMessage.type === "success" ? s.successBanner : s.errorBanner}>{licenseMessage.text}</div>
          ) : null}

          <div style={s.licenseDetailsPanel}>
            <div style={{ ...s.licenseFormGrid, ...(isCompact ? s.licenseFormGridCompact : {}) }}>
              <FormField
                label="License Number"
                value={licenseForm.licenseNumber}
                onChange={(value) => handleLicenseChange("licenseNumber", value)}
              />
              <FormField
                label="Issuing Country"
                value={licenseForm.issuingCountry}
                onChange={(value) => handleLicenseChange("issuingCountry", value)}
              />
              <FormField
                label="Expiry Date"
                type="date"
                value={licenseForm.expiryDate}
                onChange={(value) => handleLicenseChange("expiryDate", value)}
              />
            </div>
          </div>

          <div style={s.licenseActions}>
            <button style={s.primaryBtn} type="button" onClick={handleVerifyLicense} disabled={licenseVerifying}>
              <Save size={18} /> {licenseVerifying ? "Verifying with AI and OCR..." : "Verify"}
            </button>
          </div>

          <div style={{ ...s.licenseUploadGrid, ...(isCompact ? s.licenseUploadGridCompact : {}) }}>
            <UploadCard
              title="Front Image"
              imageUrl={license?.frontImageUrl}
              previewUrl={licensePreviews.front}
              onFile={(file) => handleSelectLicenseImage("front", file)}
            />
            <UploadCard
              title="Back Image"
              imageUrl={license?.backImageUrl}
              previewUrl={licensePreviews.back}
              onFile={(file) => handleSelectLicenseImage("back", file)}
            />
          </div>

          {verification ? (
            <div style={s.verificationPanel}>
              <h3 style={s.verificationTitle}>Verification Result</h3>
              <div style={{ ...s.verificationGrid, ...(isCompact ? s.verificationGridCompact : {}) }}>
                <InfoRow icon={<User size={18} />} label="Verdict" value={verification.verdict || "-"} />
                <InfoRow icon={<Star size={18} />} label="Final Decision" value={verification.verified ? "Yes" : "No"} />
                <InfoRow icon={<Star size={18} />} label="License Number" value={verification.licenseNumberMatches ? "Matches" : "Mismatch"} />
                <InfoRow icon={<Star size={18} />} label="Issuing Country" value={verification.issuingCountryMatches ? "Matches" : "Mismatch"} />
                <InfoRow icon={<Star size={18} />} label="Expiry Date" value={verification.expiryDateMatches ? "Matches" : "Mismatch"} />
                <InfoRow icon={<Star size={18} />} label="Profile Name" value={verification.profileNameMatches ? "Matches" : "Mismatch"} />
              </div>
              <div style={s.verificationMeta}>
                <p style={s.verificationText}>Recommendation: {verification.recommendation || "-"}</p>
              </div>
            </div>
          ) : null}
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

const UploadCard = ({ title, imageUrl, previewUrl, onFile }) => (
  <div style={s.uploadCard}>
    <div style={s.uploadHeader}>
      <h3 style={s.uploadTitle}>{title}</h3>
      <label style={s.uploadButton}>
        Take / Upload Photo
        <input
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </label>
    </div>
    {previewUrl || imageUrl ? (
      <img src={previewUrl || resolveMediaUrl(imageUrl)} alt={title} style={s.licensePreview} />
    ) : (
      <div style={s.emptyPreview}>No image uploaded yet</div>
    )}
  </div>
);

const readError = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const s = {
  mainContent: { width: "100%", color: "#fff" },
  mainContentCompact: { paddingBottom: "24px" },
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
  profileInfoSectionCompact: {
    padding: "0 18px 22px",
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: "-36px",
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
  actionGroupCompact: {
    flexWrap: "wrap",
    width: "100%",
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
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "25px",
    alignItems: "start",
  },
  profileGridCompact: {
    gridTemplateColumns: "1fr",
  },
  statsContainer: { gridColumn: "1 / -1", display: "flex", gap: "20px", flexWrap: "wrap" },
  statsContainerCompact: { gap: "14px" },
  statCard: {
    flex: 1, background: "#0f172a", padding: "20px",
    borderRadius: "20px", border: "1px solid #1e293b",
    display: "flex", alignItems: "center", gap: "15px", minWidth: "220px"
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
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: "16px"
  },
  licenseFormGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px"
  },
  licenseFormGridCompact: {
    gridTemplateColumns: "1fr",
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
  },
  licenseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "20px"
  },
  licenseHeaderCompact: {
    flexDirection: "column",
  },
  licenseSubtitle: {
    color: "#94a3b8",
    marginTop: "-10px",
    maxWidth: "640px",
    lineHeight: 1.5
  },
  verifiedBadge: {
    background: "rgba(16, 185, 129, 0.18)",
    color: "#34d399",
    border: "1px solid rgba(16, 185, 129, 0.35)",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: 700
  },
  pendingBadge: {
    background: "rgba(245, 158, 11, 0.18)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: 700
  },
  successBanner: {
    background: "rgba(20, 83, 45, 0.25)",
    color: "#bbf7d0",
    border: "1px solid #14532d",
    borderRadius: "14px",
    padding: "12px 14px",
    marginBottom: "18px"
  },
  errorBanner: {
    background: "rgba(127, 29, 29, 0.25)",
    color: "#fecaca",
    border: "1px solid #7f1d1d",
    borderRadius: "14px",
    padding: "12px 14px",
    marginBottom: "18px"
  },
  licenseActions: {
    display: "flex",
    gap: "12px",
    marginTop: "18px",
    marginBottom: "22px",
    flexWrap: "wrap"
  },
  licenseDetailsPanel: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "18px"
  },
  licenseUploadGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: "20px",
    marginBottom: "24px"
  },
  licenseUploadGridCompact: {
    gap: "16px",
  },
  uploadCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "20px",
    padding: "18px"
  },
  uploadHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    marginBottom: "14px"
  },
  uploadTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 600
  },
  uploadButton: {
    background: "#2563eb",
    color: "#fff",
    borderRadius: "12px",
    padding: "10px 14px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px"
  },
  licensePreview: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    borderRadius: "16px",
    border: "1px solid #334155",
    background: "#0b1120"
  },
  emptyPreview: {
    height: "220px",
    borderRadius: "16px",
    border: "1px dashed #334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    background: "#0b1120"
  },
  verificationPanel: {
    marginTop: "10px",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "20px",
    padding: "20px"
  },
  verificationTitle: {
    marginTop: 0,
    marginBottom: "16px",
    fontSize: "18px"
  },
  verificationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: "16px"
  },
  verificationGridCompact: {
    gap: "12px",
  },
  licenseCardCompact: {
    gridColumn: "auto",
  },
  licenseCardWide: {
    gridColumn: "span 2",
  },
  verificationMeta: {
    marginTop: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  verificationText: {
    margin: 0,
    color: "#cbd5e1"
  }
};
