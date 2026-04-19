import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signIn(form.email, form.password);

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
        <div style={s.logo}>🚗 WheelGo</div>
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
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f0f" },
  card: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 16, padding: "48px 40px", width: "100%", maxWidth: 420 },
  logo: { fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 8px" },
  sub: { fontSize: 14, color: "#888", margin: "0 0 32px" },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 500, color: "#ccc" },
  input: { padding: "12px 16px", borderRadius: 8, border: "1px solid #333", background: "#111", color: "#fff", fontSize: 14, outline: "none" },
  error: { background: "#2a1010", border: "1px solid #5a2020", color: "#f87171", padding: "10px 14px", borderRadius: 8, fontSize: 13 },
  btn: { padding: "13px", borderRadius: 8, border: "none", background: "#e63946", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" },
};