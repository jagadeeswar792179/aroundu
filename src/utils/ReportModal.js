// src/components/ReportModal.jsx
import React, { useState } from "react";
import "./ReportModal.css";
const REPORT_TYPES = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech" },
  { value: "violent_content", label: "Violent or dangerous" },
  { value: "sexual_content", label: "Sexual or inappropriate" },
  { value: "misinformation", label: "Misinformation" },
  { value: "copyright", label: "Copyright violation" },
  { value: "other", label: "Other" },
];

function ReportModal({ isOpen, onClose, onSubmit, targetLabel, isSubmitting }) {
  const [type, setType] = useState("spam");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!type || isSubmitting) return; // extra guard
    onSubmit({ type, reason: reason.trim() || null });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content-1 report-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: "0.5rem" }}>
          Report {targetLabel || "content"}
        </h3>
        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>
          Help us keep the community safe. Choose a reason and optionally add
          more details.
        </p>

        <form onSubmit={handleSubmit} className="report-form">
          <label className="report-label">
            Reason type
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="report-select"
              required
            >
              {REPORT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="report-label">
            Additional details (optional)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="report-textarea"
              placeholder="Explain briefly why you are reporting..."
              rows={4}
            />
          </label>

          <div className="report-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={isSubmitting ? undefined : onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;
