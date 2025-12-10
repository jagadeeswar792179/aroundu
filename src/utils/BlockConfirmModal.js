import React from "react";
import "./ReportModal.css";

function BlockConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  targetName,
  isBlocking,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={isBlocking ? undefined : onClose}>
      <div
        className="modal-content-1 block-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Block {targetName || "this person"}?</h3>
        <p className="modal-sub">
          You won’t see their posts in your feed and they will not be able to
          follow or interact with you.
        </p>

        <div className="report-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={isBlocking ? undefined : onClose}
            disabled={isBlocking}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: "#c62828" }}
            onClick={isBlocking ? undefined : onConfirm}
            disabled={isBlocking}
          >
            {isBlocking ? "Blocking..." : "Block"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlockConfirmModal;
