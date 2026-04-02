import "./Modal.css";
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Don't render if closed

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span onClick={onClose}>✕</span>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
