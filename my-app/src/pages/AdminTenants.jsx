import { useEffect, useState } from "react";
import {
    getAllTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    getSupportedTenantCurrencies,
} from "../api/tenantApi";
import DeleteModal from "../components/DeleteModal";
import CreateAndEditModal from "../components/CreateAndEditModal";
import { useAuth } from "../context/AuthContext";

const PLAN_COLORS = {
    FREE: { bg: "#0f2a1a", color: "#22c55e", border: "#14532d" },
    BASIC: { bg: "#0f1f3a", color: "#60a5fa", border: "#1e3a5f" },
    PREMIUM: { bg: "#2a1a0f", color: "#f59e0b", border: "#78350f" },
    ENTERPRISE: { bg: "#2a0f2a", color: "#e879f9", border: "#701a75" },
};

const slugify = (value = "") =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

const emptyCreateForm = {
    name: "",
    slug: "",
    plan: "FREE",
    active: true,
    adminEmail: "",
    adminPassword: "",
    settings: {
        currency: "EUR",
        timezone: "UTC",
        logoUrl: "",
        themeColor: "#1A73E8",
    },
};

export default function AdminTenants() {
    const { logout } = useAuth();
    const [isCompact, setIsCompact] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth <= 960 : false
    );
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | "create" | "edit"
    const [selected, setSelected] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [form, setForm] = useState(emptyCreateForm);
    const [error, setError] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [currencyOptions, setCurrencyOptions] = useState([]);

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => {
            setAlert((current) =>
                current.message === message ? { type: "", message: "" } : current
            );
        }, 3000);
    };

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

    useEffect(() => {
        load();
        getSupportedTenantCurrencies()
            .then((res) => setCurrencyOptions(Array.isArray(res.data) ? res.data : []))
            .catch(() => setCurrencyOptions([]));
    }, []);

    useEffect(() => {
        const onResize = () => setIsCompact(window.innerWidth <= 960);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const openCreate = () => {
        setForm(emptyCreateForm);
        setError("");
        setModal("create");
    };

    const openEdit = (tenant) => {
        setSelected(tenant);
        setForm({
            name: tenant.name,
            slug: tenant.slug,
            plan: tenant.plan,
            active: Boolean(tenant.active),
            adminEmail: "",
            adminPassword: "",
            settings: {
                currency: tenant.settings?.currency || "EUR",
                timezone: tenant.settings?.timezone || "UTC",
                logoUrl: tenant.settings?.logoUrl || "",
                themeColor: tenant.settings?.themeColor || "#1A73E8",
            },
        });
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
                await createTenant({
                    name: form.name.trim(),
                    slug: slugify(form.slug),
                    plan: form.plan,
                    adminEmail: form.adminEmail.trim().toLowerCase(),
                    adminPassword: form.adminPassword,
                    settings: {
                        currency: form.settings.currency.trim(),
                        timezone: form.settings.timezone.trim(),
                        logoUrl: form.settings.logoUrl.trim() || null,
                        themeColor: form.settings.themeColor.trim() || null,
                    },
                });

                closeModal();
                await load();
                showAlert("success", "Tenant and admin created successfully.");
            } else {
                await updateTenant(selected.id, {
                    name: form.name.trim(),
                    plan: form.plan,
                    isActive: form.active,
                    settings: {
                        currency: form.settings.currency.trim(),
                        timezone: form.settings.timezone.trim(),
                        logoUrl: form.settings.logoUrl.trim(),
                        themeColor: form.settings.themeColor.trim(),
                    },
                });

                closeModal();
                await load();
                showAlert("success", "Tenant updated successfully.");
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.response?.data ||
                "Something went wrong while saving.";

            setError(message);
            showAlert("error", message);
        }
    };

    const openDelete = (tenant) => {
        setDeleteError("");
        setDeleting(tenant);
    };

    const handleDelete = async () => {
        setDeleteError("");

        try {
            await deleteTenant(deleting.id);
            setDeleting(null);
            await load();
            showAlert("success", "Tenant deleted successfully.");
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.response?.data ||
                "Failed to delete tenant.";

            setDeleteError(message);
            showAlert("error", message);
        }
    };

    const formatDate = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const modalOpen = Boolean(modal);
    const modalTitle = modal === "create" ? "Add Tenant" : "Edit Tenant";
    const submitLabel = modal === "create" ? "Create" : "Save";

    return (
        <div style={{ ...s.page, ...(isCompact ? s.pageCompact : {}) }}>
            <aside style={{ ...s.sidebar, ...(isCompact ? s.sidebarCompact : {}) }}>
                <div style={s.sidebarLogo}>
                    <div style={s.logoBox}>WG</div>
                    <span style={s.logoText}>WheelGo</span>
                </div>

                <nav style={s.nav}>
                    <div style={s.navItemActive}>Tenants</div>
                </nav>

                <button type="button" onClick={logout} style={s.logoutBtn}>
                    Log out
                </button>
            </aside>

            <main style={{ ...s.main, ...(isCompact ? s.mainCompact : {}) }}>
                <div style={{ ...s.header, ...(isCompact ? s.headerCompact : {}) }}>
                    <div>
                        <h1 style={s.pageTitle}>Tenants</h1>
                        <p style={s.pageSubtitle}>{tenants.length} active companies</p>
                    </div>

                    <button type="button" onClick={openCreate} style={s.addBtn}>
                        + Add Tenant
                    </button>
                </div>

                {alert.message && (
                    <div
                        style={{
                            ...s.alert,
                            ...(alert.type === "success" ? s.alertSuccess : s.alertError),
                        }}
                    >
                        {alert.message}
                    </div>
                )}

                {loading ? (
                    <p style={{ color: "#4a5180" }}>Loading...</p>
                ) : (
                    <div style={s.tableWrap}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    {[
                                        "Name",
                                        "Slug",
                                        "Schema",
                                        "Plan",
                                        "Currency",
                                        "Timezone",
                                        "Active",
                                        "Created At",
                                        "Updated At",
                                        "Actions",
                                    ].map((h) => (
                                        <th key={h} style={s.th}>
                                            {h}
                                        </th>
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
                                            <code style={s.code}>{t.settings?.currency || "EUR"}</code>
                                        </td>
                                        <td style={s.td}>{t.settings?.timezone || "UTC"}</td>
                                        <td style={s.td}>
                                            <span
                                                style={{
                                                    ...s.dot,
                                                    background: t.active ? "#22c55e" : "#ef4444",
                                                }}
                                            />
                                        </td>
                                        <td style={s.td}>{formatDate(t.createdAt)}</td>
                                        <td style={s.td}>{formatDate(t.updatedAt)}</td>
                                        <td style={s.td}>
                                            <div style={s.actions}>
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(t)}
                                                    style={s.editBtn}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openDelete(t)}
                                                    style={s.deleteBtn}
                                                >
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

                {error && !modalOpen && (
                    <p style={{ color: "#ffffff", marginTop: "12px", fontSize: "13px" }}>
                        {error}
                    </p>
                )}
            </main>

            <CreateAndEditModal
                open={modalOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                title={modalTitle}
                submitLabel={submitLabel}
                cancelLabel="Cancel"
                error={error}
                form={form}
                setForm={setForm}
                isEdit={modal === "edit"}
                currencyOptions={currencyOptions}
            />

            <DeleteModal
                open={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                itemName={deleting?.name}
                schemaName={deleting?.schemaName}
                error={deleteError}
            />
        </div>
    );
}

const s = {
    page: {
        display: "flex",
        minHeight: "100vh",
        background: "#0a0a0f",
        fontFamily: "'Inter', sans-serif",
    },
    pageCompact: {
        display: "block",
    },
    sidebar: {
        width: "220px",
        background: "#0d0d14",
        borderRight: "1px solid #1e2030",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
    },
    sidebarCompact: {
        width: "100%",
        borderRight: "none",
        borderBottom: "1px solid #1e2030",
    },
    sidebarLogo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "32px",
    },
    logoBox: {
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
        fontSize: "14px",
        color: "#fff",
    },
    logoText: {
        color: "#f0f4ff",
        fontWeight: "700",
        fontSize: "16px",
    },
    nav: { flex: 1 },
    navItemActive: {
        color: "#60a5fa",
        background: "#0f1f3a",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
    },
    logoutBtn: {
        background: "none",
        border: "1px solid #1e2030",
        borderRadius: "8px",
        color: "#4a5180",
        padding: "10px",
        fontSize: "13px",
        cursor: "pointer",
    },
    main: {
        flex: 1,
        padding: "24px 40px",
        overflowY: "auto",
    },
    mainCompact: {
        padding: "20px 16px 28px",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "28px",
    },
    headerCompact: {
        alignItems: "flex-start",
        flexDirection: "column",
    },
    pageTitle: {
        color: "#f0f4ff",
        fontSize: "24px",
        fontWeight: "700",
        margin: 0,
    },
    pageSubtitle: {
        color: "#4a5180",
        fontSize: "13px",
        marginTop: "4px",
    },
    addBtn: {
        background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
        border: "none",
        borderRadius: "8px",
        padding: "11px 20px",
        color: "#fff",
        fontWeight: "700",
        fontSize: "13px",
        cursor: "pointer",
    },
    alert: {
        marginBottom: "16px",
        padding: "12px 14px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: "600",
        border: "1px solid",
    },
    alertSuccess: {
        background: "#0f2a1a",
        color: "#22c55e",
        borderColor: "#14532d",
    },
    alertError: {
        background: "#2a0f0f",
        color: "#ef4444",
        borderColor: "#5f1e1e",
    },
    tableWrap: {
        background: "#0d0d14",
        border: "1px solid #1e2030",
        borderRadius: "16px",
        overflowX: "auto",
        overflowY: "hidden",
        width: "100%",
    },
    table: {
        width: "100%",
        minWidth: "1250px",
        borderCollapse: "collapse",
        tableLayout: "auto",
    },
    th: {
        color: "#4a5180",
        fontSize: "12px",
        fontWeight: "600",
        padding: "14px 20px",
        textAlign: "center",
        borderBottom: "1px solid #1e2030",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    tr: {
        borderBottom: "1px solid #1e2030",
    },
    td: {
        padding: "16px 20px",
        color: "#8892b0",
        fontSize: "14px",
        textAlign: "center",
    },
    tenantName: {
        color: "#f0f4ff",
        fontWeight: "600",
    },
    code: {
        background: "#0a0a0f",
        border: "1px solid #1e2030",
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "12px",
        color: "#60a5fa",
        fontFamily: "monospace",
    },
    badge: {
        borderRadius: "6px",
        padding: "3px 10px",
        fontSize: "11px",
        fontWeight: "700",
        border: "1px solid",
        letterSpacing: "0.5px",
    },
    dot: {
        display: "inline-block",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
    },
    actions: {
        display: "flex",
        gap: "8px",
        justifyContent: "center",
    },
    editBtn: {
        background: "#0f1f3a",
        border: "1px solid #1e3a5f",
        borderRadius: "6px",
        color: "#60a5fa",
        padding: "6px 14px",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
    },
    deleteBtn: {
        background: "#1a0a0a",
        border: "1px solid #3f1a1a",
        borderRadius: "6px",
        color: "#ef4444",
        padding: "6px 14px",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
    },
};
