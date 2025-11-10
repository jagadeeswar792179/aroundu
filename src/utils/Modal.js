import "./Modal.css";
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Don't render if closed

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* <button style={styles.closeBtn} onClick={onClose}>
          ✕
        </button> */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
