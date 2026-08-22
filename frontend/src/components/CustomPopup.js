import React from "react";
import "./CustomPopup.css";

const CustomPopup = ({
  isOpen,
  type = "success",
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = false
}) => {
  if (!isOpen) return null;

  const icons = {
    success: "✓",
    error: "✕",
    warning: "!",
    info: "i"
  };

  return (
    <div className="popup-overlay">
      <div className="custom-popup">

        <div className={`popup-icon ${type}`}>
          {icons[type]}
        </div>

        <h2>{title}</h2>

        <p>{message}</p>

        <div className="popup-buttons">
          {showCancel && (
            <button
              className="popup-cancel"
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}

          <button
            className={`popup-confirm ${type}`}
            onClick={onConfirm || onClose}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomPopup;