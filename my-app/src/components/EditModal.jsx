import { modalStyles as s } from "./modalStyles";

/**
 * Modal shell for create/edit forms (pass fields as children).
 */
export default function EditModal({
    open,
    onClose,
    onSubmit,
    title,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    error,
    children,
}) {
    if (!open) return null;

    return (
        <div style={s.overlay} role="presentation" onClick={onClose}>
            <div
                style={s.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="edit-modal-title" style={s.modalTitle}>{title}</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit(e);
                    }}
                    style={s.modalForm}
                >
                    {children}
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
