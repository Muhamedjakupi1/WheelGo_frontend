    import React from "react";
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Car, 
  Star, 
  Edit3,
  Camera
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function TenantUserProfile() {
  const { user } = useAuth();

  return (
    <div style={s.mainContent}>
      {/* HEADER ME COVER DHE AVATAR */}
      <header style={s.profileHeader}>
        <div style={s.coverImage}></div>
        <div style={s.profileInfoSection}>
          <div style={s.avatarWrapper}>
            <img 
              src="https://i.pravatar.cc/150?u=floyd" 
              alt="Profile" 
              style={s.largeAvatar} 
            />
            <div style={s.editAvatarBtn}><Camera size={16} /></div>
          </div>
          <div style={s.userMeta}>
            <h1 style={s.userName}>Floyd Miles</h1>
            <p style={s.userRole}>Premium Member</p>
          </div>
          <button style={s.editProfileBtn}>
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>
      </header>

      <div style={s.profileGrid}>
        {/* STATS CARDS */}
        <div style={s.statsContainer}>
          <StatCard icon={<Car size={20} color="#3b82f6"/>} label="Total Rides" value="24" />
          <StatCard icon={<Calendar size={20} color="#10b981"/>} label="Member Since" value="2023" />
          <StatCard icon={<Star size={20} color="#f59e0b"/>} label="User Rating" value="4.9" />
        </div>

        {/* DETAJET E KONTAKTIT */}
        <section style={s.card}>
          <h2 style={s.cardTitle}>Contact Details</h2>
          <div style={s.infoList}>
            <InfoRow icon={<Mail size={18}/>} label="Email" value={user?.email || "user@example.com"} />
            <InfoRow icon={<MapPin size={18}/>} label="Location" value="Pristina, Kosovo" />
            <InfoRow icon={<User size={18}/>} label="Username" value="@floyd_miles" />
          </div>
        </section>

        {/* HISTORIA E FUNDIT (Short List) */}
        <section style={s.card}>
          <h2 style={s.cardTitle}>Recent Activity</h2>
          <div style={s.activityList}>
            <ActivityItem title="Rented Audi A7" date="2 days ago" status="Completed" />
            <ActivityItem title="Updated Password" date="1 week ago" status="Security" />
            <ActivityItem title="New Booking: BMW M4" date="Just now" status="Pending" />
          </div>
        </section>
      </div>
    </div>
  );
}

// Sub-komponentët
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
      {icon} <span style={{marginLeft: 10}}>{label}:</span>
    </div>
    <span style={s.infoValue}>{value}</span>
  </div>
);

const ActivityItem = ({ title, date, status }) => (
  <div style={s.activityItem}>
    <div>
      <div style={s.activityTitle}>{title}</div>
      <div style={s.activityDate}>{date}</div>
    </div>
    <span style={{...s.statusBadge, 
      background: status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
      color: status === 'Completed' ? '#10b981' : '#3b82f6'
    }}>{status}</span>
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
  userRole: { color: "#94a3b8", margin: "5px 0 0 0" },
  editProfileBtn: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "transparent", border: "1px solid #334155",
    color: "#fff", padding: "10px 20px", borderRadius: "12px",
    cursor: "pointer", fontWeight: "600", marginBottom: "10px"
  },
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
  activityList: { display: "flex", flexDirection: "column", gap: "15px" },
  activityItem: { 
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "15px", background: "#161f2e", borderRadius: "16px"
  },
  activityTitle: { fontWeight: "600", fontSize: "15px" },
  activityDate: { fontSize: "12px", color: "#64748b", marginTop: "4px" },
  statusBadge: { fontSize: "11px", fontWeight: "700", padding: "5px 12px", borderRadius: "8px", textTransform: "uppercase" }
};