import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {checkTenant} from "../api/authApi";

export default function Login() {
  const {tenantSlug} = useParams();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect (() => {
    if(!tenantSlug){
      const lastTenant = localStorage.getItem("last_tenant_slug");
      if(lastTenant){
        navigate(`/login/${lastTenant}`, {replace: true});
      }else{
        setNotFound(true);
      }
      return;
    }
    checkTenant(tenantSlug).then(r => setTenant(r.data)).catch(()=> setNotFound(true))
  }, [tenantSlug]);

  if (notFound) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoBox}>WG</div>
        <p style={{ color: "#f87171", textAlign: "center", marginTop: 20 }}>
          Sorry, this company (tenant) was not found.
        </p>
        <Link to="/" style={{ color: "#2563eb", display: "block", textAlign: "center", marginTop: 10 }}>
          Go back home
        </Link>
      </div>
    </div>
  );

  if (!tenant) return <div style={s.page}><div style={{ color: "#888" }}>Loading...</div></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signIn(tenantSlug, form.email, form.password);

      localStorage.setItem("last_tenant_slug", tenantSlug);

      if (data.role === "SUPER_ADMIN") {
        navigate("/superadmin/tenants");
      } else if (data.role === "ADMIN") {
        navigate(`/t/${data.tenantSlug}/admin`);
      } else {
        navigate(`/t/${data.tenantSlug}/app`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Invalid credentials");
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
        <h2 style={s.title}>Sign in</h2>
        <p style={s.sub}>Enter your account credentials</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f" },
  card: { background: "#0d0d14", border: "1px solid #2a2a2a", borderRadius: 16, padding: "48px 40px", width: "100%", maxWidth: 420 },
  header: {display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "32px" },
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
  logo: { fontSize: 28, fontWeight: 750, color: "#2563eb", margin: 0, letterSpacing: "-0.5px" },
  title: { fontSize: 24, fontWeight: 700, color: "#fff", margin: "8px 0 8px" },
  sub: { fontSize: 14, color: "#888", margin: "0 0 32px",  },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 500, color: "#ccc" },
  input: { padding: "12px 16px", borderRadius: 8, border: "1px solid #1e2030", background: "#0d0d14", color: "#fff", fontSize: 14, outline: "none" },
  error: { background: "#2a1010", border: "1px solid #5a2020", color: "#f87171", padding: "10px 14px", borderRadius: 8, fontSize: 13 },
  btn: { padding: "13px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" },
};