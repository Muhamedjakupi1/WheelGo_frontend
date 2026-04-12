import { modalStyles as s } from "./modalStyles";

/**
 * Delete confirmation with optional schema warning.
 */
export default function DeleteModal({
    open,
    onClose,
    onConfirm,
    title = "Delete tenant",
    itemName,
    schemaName,
    description,
    confirmLabel = "Yes, delete",
    cancelLabel = "Cancel",
    error,
}) {
    if (!open) return null;

    const body =
        description ?? (
            <>
                Are you sure you want to delete{" "}
                <strong style={{ color: "#f0f4ff" }}>{itemName}</strong>?
                {schemaName != null && schemaName !== "" && (
                    <>
                        <br />
                        This will permanently remove the schema{" "}
                        <code style={s.code}>{schemaName}</code> and all data inside it.
                    </>
                )}
            </>
        );

    return (
        <div style={s.overlay} role="presentation" onClick={onClose}>
            <div
                style={s.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="delete-modal-title" style={{ ...s.modalTitle, ...s.modalTitleDanger }}>
                    {title}
                </h2>
                <p style={s.bodyText}>{body}</p>
                {error && <p style={{ ...s.error, marginTop: "12px" }}>{error}</p>}
                <div style={{ ...s.modalActions, marginTop: "20px" }}>
                    <button type="button" onClick={onClose} style={s.cancelBtn}>
                        {cancelLabel}
                    </button>
                    <button type="button" onClick={onConfirm} style={s.deleteBtnModal}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
