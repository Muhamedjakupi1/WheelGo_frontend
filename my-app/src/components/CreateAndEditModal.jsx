import { modalStyles as s } from "./modalStyles";

const slugify = (value = "") =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

export default function CreateAndEditModal({
    open,
    onClose,
    onSubmit,
    title,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    error,
    form,
    setForm,
    isEdit = false,
}) {
    if (!open) return null;

    const handleSlugChange = (e) => {
        setForm({ ...form, slug: slugify(e.target.value) });
    };

    const Field = ({ label, children, fullWidth = false }) => (
        <div style={{ ...s.fieldGroup, ...(fullWidth ? s.fieldSpanFull : {}) }}>
            <label style={s.label}>{label}</label>
            {children}
        </div>
    );

    return (
        <div style={s.overlay} role="presentation" onClick={onClose}>
            <div
                style={s.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="edit-modal-title" style={s.modalTitle}>
                    {title}
                </h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                    style={s.modalForm}
                >
                    <div style={s.formGrid}>
                        <Field label="Name">
                            <input
                                style={s.input}
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Enter tenant name"
                                required
                            />
                        </Field>

                        <Field label="Slug">
                            <input
                                style={{
                                    ...s.input,
                                    ...(isEdit ? { ...s.not_allowed } : {}),
                                }}
                                value={form.slug}
                                disabled={isEdit}
                                onChange={handleSlugChange}
                                placeholder="Enter tenant slug"
                                required={!isEdit}
                                title={
                                    isEdit
                                        ? "Slug cannot be changed."
                                        : "Slug will be formatted automatically."
                                }
                            />
                        </Field>

                        <Field label="Plan">
                            <select
                                style={s.select}
                                value={form.plan}
                                onChange={(e) => setForm({ ...form, plan: e.target.value })}
                            >
                                <option value="FREE">FREE</option>
                                <option value="BASIC">BASIC</option>
                                <option value="PREMIUM">PREMIUM</option>
                                <option value="ENTERPRISE">ENTERPRISE</option>
                            </select>
                        </Field>

                        <Field label="Currency">
                            <input
                                style={s.input}
                                value={form.settings.currency}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        settings: { ...form.settings, currency: e.target.value },
                                    })
                                }
                                placeholder="EUR"
                                required
                            />
                        </Field>

                        <Field label="Timezone">
                            <input
                                style={s.input}
                                value={form.settings.timezone}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        settings: { ...form.settings, timezone: e.target.value },
                                    })
                                }
                                placeholder="UTC"
                                required
                            />
                        </Field>

                        <Field label="Theme Color">
                            <div style={s.colorField}>
                                <input
                                    style={s.colorInput}
                                    type="color"
                                    value={form.settings.themeColor || "#1A73E8"}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            settings: { ...form.settings, themeColor: e.target.value },
                                        })
                                    }
                                    aria-label="Choose theme color"
                                />
                                <div style={s.colorValue}>
                                    {form.settings.themeColor || "#1A73E8"}
                                </div>
                            </div>
                        </Field>

                        <Field label="Logo URL" fullWidth>
                            <input
                                style={s.input}
                                value={form.settings.logoUrl}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        settings: { ...form.settings, logoUrl: e.target.value },
                                    })
                                }
                                placeholder="https://example.com/logo.png"
                            />
                        </Field>

                        {!isEdit && (
                            <>
                                <Field label="Admin Email">
                                    <input
                                        style={s.input}
                                        type="email"
                                        value={form.adminEmail}
                                        onChange={(e) =>
                                            setForm({ ...form, adminEmail: e.target.value })
                                        }
                                        placeholder="Enter tenant admin email"
                                        required
                                    />
                                </Field>

                                <Field label="Admin Password">
                                    <input
                                        style={s.input}
                                        type="password"
                                        value={form.adminPassword}
                                        onChange={(e) =>
                                            setForm({ ...form, adminPassword: e.target.value })
                                        }
                                        placeholder="Enter tenant admin password"
                                        required
                                    />
                                </Field>
                            </>
                        )}

                        {isEdit && (
                            <Field label="Status">
                                <select
                                    style={s.select}
                                    value={form.active ? "true" : "false"}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            active: e.target.value === "true",
                                        })
                                    }
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </Field>
                        )}
                    </div>

                    {error && <p style={s.error}>{error}</p>}

                    <div style={s.modalActions}>
                        <button type="button" onClick={onClose} style={s.cancelBtn}>
                            {cancelLabel}
                        </button>
                        <button type="submit" style={s.saveBtn}>
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
