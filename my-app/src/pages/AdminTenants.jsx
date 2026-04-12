import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getAllTenants,
    createTenant,
    updateTenant,
    deleteTenant,
} from "../api/tenantApi";
import DeleteModal from "../components/DeleteModal";
import EditModal from "../components/EditModal";
import { modalStyles as ms } from "../components/modalStyles";

const PLAN_COLORS = {
    FREE: { bg: "#0f2a1a", color: "#22c55e", border: "#14532d" },
    PRO: { bg: "#0f1f3a", color: "#60a5fa", border: "#1e3a5f" },
    ENTERPRISE: { bg: "#2a1a0f", color: "#f59e0b", border: "#78350f" },
};

export default function AdminTenants() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | "create" | "edit"
    const [selected, setSelected] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [form, setForm] = useState({ name: "", slug: "", plan: "FREE" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const load = async () => {
        try {
            const res = await getAllTenants();
            setTenants(res.data);
            setError("");
        } catch {
            setError("Failed to load tenants.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const logout = () => {
        localStorage.removeItem("admin_auth");
        navigate("/admin/login");
    };

    const openCreate = () => {
        setForm({ name: "", slug: "", plan: "FREE" });
        setError("");
        setModal("create");
    };

    const openEdit = (tenant) => {
        setSelected(tenant);
        setForm({ name: tenant.name, slug: tenant.slug, plan: tenant.plan });
        setError("");
        setModal("edit");
    };

    const closeModal = () => {
        setModal(null);
        setSelected(null);
        setError("");
    };

    const handleSubmit = async () => {
        setError("");
        try {
            if (modal === "create") {
                await createTenant(form);
            } else {
                await updateTenant(selected.id, form);
            }
            closeModal();
            load();
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong while saving.");
        }
    };

    const handleDelete = async () => {
        setDeleteError("");
        try {
            await deleteTenant(deleting.id);
            setDeleting(null);
            load();
        } catch {
            setDeleteError("Failed to delete tenant.");
        }
    };

    const openDelete = (tenant) => {
        setDeleteError("");
        setDeleting(tenant);
    };

    const editModalOpen = Boolean(modal);
    const editTitle = modal === "create" ? "Add tenant" : "Edit tenant";
    const submitLabel = modal === "create" ? "Create" : "Save";

    return (
        <div style={s.page}>
            <aside style={s.sidebar}>
                <div style={s.sidebarLogo}>
                    <div style={s.logoBox}>WG</div>
                    <span style={s.logoText}>WheelGo</span>
                </div>
                <nav style={s.nav}>
                    <div style={s.navItemActive}>Tenants</div>
                </nav>
                <button type="button" onClick={logout} style={s.logoutBtn}>Log out</button>
            </aside>

            <main style={s.main}>
                <div style={s.header}>
                    <div>
                        <h1 style={s.pageTitle}>Tenants</h1>
                        <p style={s.pageSubtitle}>{tenants.length} active companies</p>
                    </div>
                    <button type="button" onClick={openCreate} style={s.addBtn}>+ Add tenant</button>
                </div>

                {loading ? (
                    <p style={{ color: "#4a5180" }}>Loading...</p>
                ) : (
                    <div style={s.tableWrap}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    {["Name", "Slug", "Schema", "Plan", "Active", "Actions"].map((h) => (
                                        <th key={h} style={s.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.map((t) => (
                                    <tr key={t.id} style={s.tr}>
                                        <td style={s.td}>
                                            <span style={s.tenantName}>{t.name}</span>
                                        </td>
                                        <td style={s.td}>
                                            <code style={s.code}>{t.slug}</code>
                                        </td>
                                        <td style={s.td}>
                                            <code style={s.code}>{t.schemaName}</code>
                                        </td>
                                        <td style={s.td}>
                                            <span style={{ ...s.badge, ...PLAN_COLORS[t.plan] }}>
                                                {t.plan}
                                            </span>
                                        </td>
                                        <td style={s.td}>
                                            <span style={{ ...s.dot, background: t.active ? "#22c55e" : "#ef4444" }} />
                                        </td>
                                        <td style={s.td}>
                                            <div style={s.actions}>
                                                <button type="button" onClick={() => openEdit(t)} style={s.editBtn}>
                                                    Edit
                                                </button>
                                                <button type="button" onClick={() => openDelete(t)} style={s.deleteBtn}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {error && !editModalOpen && (
                    <p style={{ ...ms.error, marginTop: "12px" }}>{error}</p>
                )}
            </main>

            <EditModal
                open={editModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                title={editTitle}
                submitLabel={submitLabel}
                cancelLabel="Cancel"
                error={error}
            >
                <label style={ms.label} htmlFor="tenant-name">Name</label>
                <input
                    id="tenant-name"
                    style={ms.input}
                    placeholder="Hertz Kosovo"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />
                <label style={ms.label} htmlFor="tenant-slug">Slug</label>
                <input
                    id="tenant-slug"
                    style={ms.input}
                    placeholder="hertz"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    required
                    disabled={modal === "edit"}
                />
                <label style={ms.label} htmlFor="tenant-plan">Plan</label>
                <select
                    id="tenant-plan"
                    style={ms.select}
                    value={form.plan}
                    onChange={(e) => setForm({ ...form, plan: e.target.value })}
                >
                    <option value="FREE">FREE</option>
                    <option value="PRO">PRO</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
            </EditModal>

            <DeleteModal
                open={Boolean(deleting)}
                onClose={() => {
                    setDeleting(null);
                    setDeleteError("");
                }}
                onConfirm={handleDelete}
                itemName={deleting?.name}
                schemaName={deleting?.schemaName}
                error={deleteError}
            />
        </div>
    );
}

const s = {
    page: { display: "flex", minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', sans-serif" },
    sidebar: { width: "220px", background: "#0d0d14", borderRight: "1px solid #1e2030", display: "flex", flexDirection: "column", padding: "24px 16px" },
    sidebarLogo: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" },
    logoBox: { width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, #0ea5e9, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "14px", color: "#fff" },
    logoText: { color: "#f0f4ff", fontWeight: "700", fontSize: "16px" },
    nav: { flex: 1 },
    navItemActive: { color: "#60a5fa", background: "#0f1f3a", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
    logoutBtn: { background: "none", border: "1px solid #1e2030", borderRadius: "8px", color: "#4a5180", padding: "10px", fontSize: "13px", cursor: "pointer" },
    main: { flex: 1, padding: "32px 40px", overflowY: "auto" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
    pageTitle: { color: "#f0f4ff", fontSize: "24px", fontWeight: "700", margin: 0 },
    pageSubtitle: { color: "#4a5180", fontSize: "13px", marginTop: "4px" },
    addBtn: { background: "linear-gradient(135deg, #0ea5e9, #2563eb)", border: "none", borderRadius: "8px", padding: "11px 20px", color: "#fff", fontWeight: "700", fontSize: "13px", cursor: "pointer" },
    tableWrap: { background: "#0d0d14", border: "1px solid #1e2030", borderRadius: "12px", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { color: "#4a5180", fontSize: "12px", fontWeight: "600", padding: "14px 20px", textAlign: "left", borderBottom: "1px solid #1e2030", textTransform: "uppercase", letterSpacing: "0.5px" },
    tr: { borderBottom: "1px solid #1e2030" },
    td: { padding: "16px 20px", color: "#8892b0", fontSize: "14px" },
    tenantName: { color: "#f0f4ff", fontWeight: "600" },
    code: { background: "#0a0a0f", border: "1px solid #1e2030", borderRadius: "4px", padding: "2px 8px", fontSize: "12px", color: "#60a5fa", fontFamily: "monospace" },
    badge: { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: "700", border: "1px solid", letterSpacing: "0.5px" },
    dot: { display: "inline-block", width: "8px", height: "8px", borderRadius: "50%" },
    actions: { display: "flex", gap: "8px" },
    editBtn: { background: "#0f1f3a", border: "1px solid #1e3a5f", borderRadius: "6px", color: "#60a5fa", padding: "6px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
    deleteBtn: { background: "#1a0a0a", border: "1px solid #3f1a1a", borderRadius: "6px", color: "#ef4444", padding: "6px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
};
