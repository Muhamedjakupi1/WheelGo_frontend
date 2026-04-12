import { modalStyles as s } from "./modalStyles";

/**
 * Generic confirmation dialog (English copy via props).
 */
export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title = "Confirm",
    message,
    children,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
}) {
    if (!open) return null;

    const confirmStyle = variant === "danger" ? s.deleteBtnModal : s.confirmBtn;

    return (
        <div style={s.overlay} role="presentation" onClick={onClose}>
            <div
                style={s.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <h2
                    id="confirm-modal-title"
                    style={{
                        ...s.modalTitle,
                        ...(variant === "danger" ? s.modalTitleDanger : {}),
                    }}
                >
                    {title}
                </h2>
                {message && <p style={s.bodyText}>{message}</p>}
                {children}
                <div
                    style={{
                        ...s.modalActions,
                        marginTop: message || children ? "20px" : "8px",
                    }}
                >
                    <button type="button" onClick={onClose} style={s.cancelBtn}>
                        {cancelLabel}
                    </button>
                    <button type="button" onClick={onConfirm} style={confirmStyle}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
