import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { checkTenant } from "../../api/authApi";

const RESERVED_SIGNUP_TENANTS = new Set(["super-admin-tenant"]);

export default function SignUp() {
  const { tenantSlug } = useParams();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  useEffect(() => {
    if (tenantSlug && RESERVED_SIGNUP_TENANTS.has(tenantSlug.toLowerCase())) {
      setUnauthorized(true);
      setTenant(null);
      setNotFound(false);
      return;
    }

    setUnauthorized(false);
    checkTenant(tenantSlug)
      .then((r) => setTenant(r.data))
      .catch(() => setNotFound(true));
  }, [tenantSlug]);

  if (unauthorized) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logoBox}>WG</div>
          <div style={s.logo}>WheelGo</div>
          <p style={{ color: "#f87171", textAlign: "center", fontSize: 16, marginTop: 20 }}>
            Unauthorized
          </p>
          <p style={{ color: "#888", textAlign: "center", fontSize: 14, marginTop: 10 }}>
            Signup is disabled for this tenant.
          </p>
          <p style={s.footer}>
            <Link to={`/login/${tenantSlug}`} style={s.link}>Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  if (notFound) return (
    <div style={s.page}>
      <div style={s.card}>
       <div style={s.logoBox}>WG</div>
      <div style={s.logo}>WheelGo</div>
      <p style={{ color:"#f87171", textAlign:"center", fontSize:16 }}>
        Sorry, this tenant does not exist.
      </p>
    </div></div>
  );

  if (!tenant) return <div style={s.page}><div style={{ color:"#888" }}>Loading...</div></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (!emailRegex.test(form.email)) {
      setError("Invalid email format");
      return;
    }
    if (!passwordRegex.test(form.password)) {
      setError("Password must be at least 8 chars, include 1 uppercase and 1 number");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
      try {                                                                                                                                         
        await signup(tenantSlug, form.email, form.password);                                                                                        
        navigate(`/t/${tenantSlug}/app`);                                                                                                           
      } catch (err) {                                                                                                                               
        setError(err.response?.data?.message || err.response?.data || "Signup failed");                                                             
      } finally {                                                                                                                                   
        setLoading(false);                                                                                                                          
      }     
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style = {s.header}>
         <div style={s.logoBox}>WG</div>
        <div style={s.logo}>WheelGo</div>
        </div>
        <h2 style={s.title}>{tenant.name}</h2>
        <p style={s.sub}>Create Account</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="••••••••" title="At least 8 characters, 1 uppercase letter and 1 number"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Confirm Password</label>
            <input style={s.input} type="password" placeholder="••••••••" title="At least 8 characters, 1 uppercase letter and 1 number"
              value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
          </div>
          {error && <div style={s.error}>{error}</div>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p style={s.footer}>Already have an account?{" "}
          <Link to={`/login/${tenantSlug}`} style={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:   { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0a0a0f" },
  card:   { background:"#0d0d14", border:"1px solid #2a2a2a", borderRadius:16, padding:"48px 40px", width:"100%", maxWidth:420 },
  header: {display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "32px" },
  logo:   { fontSize:28, fontWeight:700, color:"#2563eb",  },
  logoBox: {
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
        fontSize: "14px",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
    },
  title:  { fontSize:24, fontWeight:700, color:"#fff", margin:"0 0 8px" },
  sub:    { fontSize:14, color:"#888", margin:"0 0 32px" },
  form:   { display:"flex", flexDirection:"column", gap:20 },
  field:  { display:"flex", flexDirection:"column", gap:8 },
  label:  { fontSize:13, fontWeight:500, color:"#ccc" },
  input:  { padding:"12px 16px", borderRadius:8, border:"1px solid #333", background:"#111", color:"#fff", fontSize:14, outline:"none" },
  error:  { background:"#2a1010", border:"1px solid #5a2020", color:"#f87171", padding:"10px 14px", borderRadius:8, fontSize:13 },
  btn:    { padding:"13px", borderRadius:8, border:"none", background:"#2563eb", color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer" },
  footer: { textAlign:"center", marginTop:24, fontSize:14, color:"#888" },
  link:   { color:"#2563eb", textDecoration:"none", fontWeight:500 },
};
