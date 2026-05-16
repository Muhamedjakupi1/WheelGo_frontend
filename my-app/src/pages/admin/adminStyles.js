export const palette = {
  page: "#080b12",
  sidebar: "#0d1422",
  panel: "#121b2d",
  panelAlt: "#0f1727",
  border: "#223049",
  text: "#e5edf8",
  muted: "#8ea0bd",
  primary: "#38bdf8",
  primaryStrong: "#0ea5e9",
  danger: "#f87171",
  success: "#34d399",
  warning: "#fbbf24",
};

export const layout = {
  shell: { display: "flex", minHeight: "100vh", background: palette.page },
  sidebar: {
    width: "270px",
    background: `linear-gradient(180deg, ${palette.sidebar}, #09101c)`,
    borderRight: `1px solid ${palette.border}`,
    padding: "28px 18px",
    position: "fixed",
    inset: "0 auto 0 0",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  main: {
    flex: 1,
    marginLeft: "270px",
    padding: "32px",
    color: palette.text,
    width: "calc(100% - 270px)",
  },
  brand: { display: "flex", alignItems: "center", gap: "12px", padding: "0 8px" },
  brandMark: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #38bdf8, #2563eb)",
    color: "#fff",
    fontWeight: 800,
  },
  nav: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  navCompact: { display: "flex", flexWrap: "wrap", gap: "8px", flex: 1 },
  contentStack: { display: "flex", flexDirection: "column", gap: "24px" },
};

export const card = {
  panel: {
    background: `linear-gradient(180deg, ${palette.panel}, ${palette.panelAlt})`,
    border: `1px solid ${palette.border}`,
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
  },
  title: { margin: 0, fontSize: "1.2rem", fontWeight: 700, color: palette.text },
  subtitle: { margin: "6px 0 0", color: palette.muted, fontSize: "0.95rem" },
};

export const grid = {
  two: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
    gap: "24px",
    alignItems: "start",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
  },
};

export const form = {
  stack: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "0.88rem", fontWeight: 600, color: palette.muted },
  input: {
    background: "#09101c",
    border: `1px solid ${palette.border}`,
    color: palette.text,
    borderRadius: "12px",
    padding: "12px 14px",
    outline: "none",
    fontSize: "0.95rem",
  },
  textarea: {
    background: "#09101c",
    border: `1px solid ${palette.border}`,
    color: palette.text,
    borderRadius: "12px",
    padding: "12px 14px",
    outline: "none",
    fontSize: "0.95rem",
    minHeight: "96px",
    resize: "vertical",
  },
  actions: { display: "flex", gap: "12px", flexWrap: "wrap" },
};

export const button = {
  primary: {
    border: "none",
    background: "linear-gradient(135deg, #38bdf8, #2563eb)",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondary: {
    border: `1px solid ${palette.border}`,
    background: "transparent",
    color: palette.text,
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  danger: {
    border: "1px solid rgba(248,113,113,0.35)",
    background: "rgba(248,113,113,0.12)",
    color: palette.danger,
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
  },
  ghost: {
    border: `1px solid ${palette.border}`,
    background: "#09101c",
    color: palette.muted,
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export const table = {
  wrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  headCell: {
    textAlign: "left",
    padding: "14px 12px",
    color: palette.muted,
    fontSize: "0.78rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    borderBottom: `1px solid ${palette.border}`,
  },
  cell: {
    padding: "16px 12px",
    borderBottom: `1px solid rgba(34,48,73,0.65)`,
    verticalAlign: "top",
    color: palette.text,
  },
};

export const badge = (tone = "default") => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  borderRadius: "999px",
  padding: "6px 10px",
  fontSize: "0.78rem",
  fontWeight: 700,
  background:
    tone === "success"
      ? "rgba(52,211,153,0.12)"
      : tone === "danger"
        ? "rgba(248,113,113,0.12)"
        : tone === "warning"
          ? "rgba(251,191,36,0.12)"
          : "rgba(56,189,248,0.12)",
  color:
    tone === "success"
      ? palette.success
      : tone === "danger"
        ? palette.danger
        : tone === "warning"
          ? palette.warning
          : palette.primary,
  border: `1px solid ${tone === "success" ? "rgba(52,211,153,0.2)" : tone === "danger" ? "rgba(248,113,113,0.2)" : tone === "warning" ? "rgba(251,191,36,0.2)" : "rgba(56,189,248,0.2)"}`,
});

export const emptyState = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "180px",
  color: palette.muted,
  border: `1px dashed ${palette.border}`,
  borderRadius: "16px",
};

