import React from "react";

function HRModal({
  open,
  title,
  message,
  type = "info",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  children
}) {
  if (!open) {
    return null;
  }

  const icons = {
    success: "✓",
    error: "×",
    warning: "!",
    info: "i",
    delete: "×"
  };

  const icon = icons[type] || icons.info;

  return (
    <div className="hr-modal-overlay">
      <div className="hr-modal">

        <div className={`hr-modal-icon ${type}`}>
          {icon}
        </div>

        <div className="hr-modal-content">

          <h2>{title}</h2>

          {message && (
            <p>{message}</p>
          )}

          {children}

        </div>

        <div className="hr-modal-actions">

          {onCancel && (
            <button
              className="hr-modal-cancel"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}

          {onConfirm && (
            <button
              className={`hr-modal-confirm ${type}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

export default HRModal;