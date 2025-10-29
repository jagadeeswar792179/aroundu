import React from "react";
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Don't render if closed

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={styles.container}
        onClick={(e) => e.stopPropagation()}
        className="modal-ins"
      >
        <button style={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: "8px",
    right: "8px",
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
  },
};

export default Modal;
