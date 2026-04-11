import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_PASSWORD = "wheelgo2026";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            localStorage.setItem("admin_auth", "true");
            navigate("/admin/tenants");
        } else {
            setError("Fjalëkalimi është i gabuar.");
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.logo}>WG</div>
                <h1 style={styles.title}>Admin Panel</h1>
                <p style={styles.subtitle}>WheelGo Management</p>
                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="password"
                        placeholder="Fjalëkalimi"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                    />
                    {error && <p style={styles.error}>{error}</p>}
                    <button type="submit" style={styles.button}>
                        Hyr
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
    },
    card: {
        background: "#111118",
        border: "1px solid #1e2030",
        borderRadius: "16px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "380px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
    },
    logo: {
        width: "52px",
        height: "52px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
        fontSize: "20px",
        color: "#fff",
        letterSpacing: "1px",
    },
    title: {
        color: "#f0f4ff",
        fontSize: "22px",
        fontWeight: "700",
        margin: 0,
    },
    subtitle: {
        color: "#4a5180",
        fontSize: "13px",
        margin: 0,
    },
    form: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginTop: "8px",
    },
    input: {
        background: "#0d0d14",
        border: "1px solid #1e2030",
        borderRadius: "8px",
        padding: "12px 14px",
        color: "#f0f4ff",
        fontSize: "14px",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
    },
    button: {
        background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
        border: "none",
        borderRadius: "8px",
        padding: "13px",
        color: "#fff",
        fontWeight: "700",
        fontSize: "14px",
        cursor: "pointer",
        letterSpacing: "0.5px",
    },
    error: {
        color: "#ef4444",
        fontSize: "13px",
        margin: 0,
    },
};