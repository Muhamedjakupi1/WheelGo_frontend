import { modalStyles as s } from "./modalStyles";

const slugify = (value = "") =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "");

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
                    <label style={s.label}>Name</label>
                    <input
                        style={s.input}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter tenant name"
                        required
                    />

                    <label style={s.label}>Slug</label>
                    <input
                        style={{
                            ...s.input,
                            ...(isEdit
                                ? { ...s.not_allowed}
                                : {}),
                        }}
                        value={form.slug}
                        disabled={isEdit}
                        onChange={handleSlugChange}
                        placeholder="Enter tenant slug"
                        required={!isEdit}
                        title={isEdit ? "Slug cannot be changed." : "Slug will be formatted automatically."}
                    />

                    <label style={s.label}>Plan</label>
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

                    <label style={s.label}>Status</label>
                    <select
                        style={s.select}
                        value={form.active ? "true" : "false"}
                        onChange={(e) =>
                            setForm({ ...form, active: e.target.value === "true" })
                        }
                    >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>

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