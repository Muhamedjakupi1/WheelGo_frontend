import React from "react";
import { 
  LayoutGrid, 
  Clock, 
  Settings, 
  MessageSquare, 
  User, 
  Headphones, 
  Calendar as CalendarIcon,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function TenantBookingPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      {/* MAIN CONTENT */}
      <main style={s.mainContent}>
        <header style={s.topbar}>
          <div>
            <h1 style={s.greeting}>My Bookings</h1>
            <p style={{color: '#64748b', marginTop: 5}}>Menaxho rezervimet dhe historinë tënde</p>
          </div>
          
          <div style={s.filterActions}>
            <div style={s.filterBtn}>
              <Filter size={18} />
              <span>Filter</span>
            </div>
            <div style={s.datePicker}>
              <CalendarIcon size={18} />
              <span>All Time</span>
            </div>
          </div>
        </header>

        {/* ACTIVE BOOKING SECTION (Hero Style) */}
        <section style={s.activeBookingCard}>
          <div style={s.activeBadge}>Current Rental</div>
          <div style={s.activeContent}>
            <div style={s.carInfo}>
              <h2 style={{fontSize: 28, margin: 0}}>Tesla Model 3 Performance</h2>
              <p style={{color: '#94a3b8'}}>Rezervuar deri më 28 Prill, 2024</p>
              
              <div style={s.statusTimeline}>
                <div style={s.timelinePoint}><CheckCircle2 size={16} color="#3b82f6"/> Picked Up</div>
                <div style={s.timelineLine}></div>
                <div style={s.timelinePoint}><AlertCircle size={16} color="#64748b"/> In Use</div>
                <div style={s.timelineLine} opacity="0.3"></div>
                <div style={s.timelinePoint} color="#64748b">Return</div>
              </div>
            </div>
            <img 
              src="https://www.pngplay.com/wp-content/uploads/13/Tesla-Model-3-Transparent-Background.png" 
              alt="Active Car" 
              style={s.activeCarImg}
            />
          </div>
        </section>

        {/* BOOKING HISTORY TABLE */}
        <section style={{marginTop: 40}}>
          <h3 style={{fontSize: 22, marginBottom: 20}}>Recent History</h3>
          <div style={s.tableContainer}>
            <table style={s.table}>
              <thead>
                <tr style={s.tableHeaderRow}>
                  <th style={s.th}>Car</th>
                  <th style={s.th}>Order ID</th>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Price</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}></th>
                </tr>
              </thead>
              <tbody>
                <BookingRow 
                  car="BMW M4 Competition" 
                  id="#BR-9283" 
                  date="12 Mar - 15 Mar" 
                  price="$450.00" 
                  status="Completed" 
                  img="https://www.pngplay.com/wp-content/uploads/13/BMW-M4-Transparent-Images.png"
                />
                <BookingRow 
                  car="Audi RS7 Sportback" 
                  id="#BR-8122" 
                  date="05 Feb - 07 Feb" 
                  price="$320.00" 
                  status="Completed"
                  img="https://www.pngplay.com/wp-content/uploads/13/Audi-A7-Transparent-Images.png"
                />
              </tbody>
            </table>
          </div>
        </section>
      </main>
      </div>
  );
}

// Sub-komponentet
const NavItem = ({ icon, label, active }) => (
  <div style={{
    ...s.navItem, 
    background: active ? "rgba(59, 130, 246, 0.1)" : "transparent",
    color: active ? "#3b82f6" : "#94a3b8", 
    fontWeight: active ? "600" : "400"
  }}>
    {icon} <span>{label}</span>
  </div>
);

const BookingRow = ({ car, id, date, price, status, img }) => (
  <tr style={s.tr}>
    <td style={s.td}>
      <div style={{display: 'flex', alignItems: 'center', gap: 15}}>
        <div style={s.tableImgBox}><img src={img} width="40" alt="car"/></div>
        <span style={{fontWeight: '600'}}>{car}</span>
      </div>
    </td>
    <td style={s.td}>{id}</td>
    <td style={s.td}>{date}</td>
    <td style={s.td}>{price}</td>
    <td style={s.td}>
      <span style={s.statusBadge}>{status}</span>
    </td>
    <td style={s.td}><ChevronRight size={18} color="#64748b" cursor="pointer"/></td>
  </tr>
);

const s = {
  dashboardContainer: { display: "flex", minHeight: "100vh", background: "#080a0f", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" },
  sidebar: { width: "260px", background: "#0b121e", padding: "40px 20px", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column" },
  logoSection: { marginBottom: "50px", paddingLeft: "15px" },
  logoText: { fontSize: "24px", fontWeight: "bold", margin: 0, color: "#fff" },
  logoUnderline: { width: "30px", height: "3px", background: "#3b82f6", marginTop: "4px", boxShadow: "0 0 10px #3b82f6" },
  nav: { display: "flex", flexDirection: "column", gap: "8px" },
  navItem: { display: "flex", alignItems: "center", gap: "15px", cursor: "pointer", padding: "12px 15px", borderRadius: "12px" },
  logoutBtnSidebar: { width: '100%', padding: '12px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '10px', cursor: 'pointer' },

  mainContent: { flex: 1, padding: "40px", overflowY: "auto" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
  greeting: { fontSize: "32px", fontWeight: "700", margin: 0, color: "#fff" },
  
  filterActions: { display: "flex", gap: "15px" },
  filterBtn: { display: "flex", alignItems: "center", gap: "8px", background: "#161f2e", padding: "10px 20px", borderRadius: "10px", border: "1px solid #2d3748", cursor: "pointer" },
  datePicker: { display: "flex", alignItems: "center", gap: "8px", background: "#3b82f6", padding: "10px 20px", borderRadius: "10px", cursor: "pointer" },

  activeBookingCard: { 
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", 
    borderRadius: "28px", 
    padding: "40px", 
    border: "1px solid #334155",
    position: "relative",
    overflow: "hidden"
  },
  activeBadge: { background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6", padding: "6px 15px", borderRadius: "20px", fontSize: 12, fontWeight: '700', width: 'fit-content', marginBottom: 20 },
  activeContent: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  carInfo: { flex: 1 },
  activeCarImg: { width: "45%", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))" },
  
  statusTimeline: { display: "flex", alignItems: "center", gap: "10px", marginTop: 30 },
  timelinePoint: { display: "flex", alignItems: "center", gap: "5px", fontSize: 14 },
  timelineLine: { height: "2px", width: "40px", background: "#3b82f6" },

  tableContainer: { background: "#0b121e", borderRadius: "24px", padding: "20px", border: "1px solid #1e293b" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "15px", color: "#64748b", fontWeight: "500", borderBottom: "1px solid #1e293b" },
  tr: { borderBottom: "1px solid #1e293b" },
  td: { padding: "20px 15px" },
  tableImgBox: { background: "#161f2e", padding: "5px", borderRadius: "8px" },
  statusBadge: { background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "5px 12px", borderRadius: "8px", fontSize: 13 },
};