import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";

export default function TenantUserDashboard() {
  const { user, logout } = useAuth();
  const { tenantSlug } = useParams();
  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.logo}>🚗 {tenantSlug}</span>
        <button style={s.btn} onClick={logout}>Logout</button>
      </div>
      <div style={s.content}>
        <h1 style={s.title}>Welcome back</h1>
        <p style={s.sub}>Logged in as <strong>{user?.email}</strong></p>
      </div>
    </div>
  );
}
const s = {
  page:    { minHeight:"100vh", background:"#0f0f0f", color:"#fff" },
  header:  { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 40px", borderBottom:"1px solid #2a2a2a" },
  logo:    { fontSize:20, fontWeight:700 },
  btn:     { padding:"8px 18px", background:"#e63946", border:"none", borderRadius:8, color:"#fff", cursor:"pointer" },
  content: { padding:"60px 40px" },
  title:   { fontSize:32, fontWeight:700, margin:"0 0 12px" },
  sub:     { color:"#888", fontSize:16 },
};