import { useState, useEffect } from "react";
import api from "../utils/api";
import { BeatLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";

export default function DeleteAccountModal({ close }) {
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("input");
  // input → confirm → deleting

  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ⏳ countdown logic
  useEffect(() => {
    if (step !== "confirm") return;

    if (countdown === 0) {
      handleDelete();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleStartDelete = () => {
    setError("");
    setStep("confirm");
    setCountdown(5);
  };

  const handleCancel = () => {
    setStep("input");
    setCountdown(5);
  };

  const handleDelete = async () => {
    try {
      setStep("deleting");

      await api.delete("/api/settings/delete-account", {
        data: { password },
      });
      // 🔥 logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete");
      setStep("input");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Delete Account</h3>
          <FiX style={{ cursor: "pointer" }} onClick={close} />
        </div>

        {/* STEP 1: PASSWORD */}
        {(step === "input" || step === "confirm") && (
          <>
            <p style={{ color: "#e36767", fontSize: "13px" }}>
              Warning: This action is permanent and cannot be undone.
            </p>
            <br />
            {/* <p style={{ color: "#888" }}>Enter your password to continue</p> */}
            <input
              type="password"
              placeholder="Enter your password to continue"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              className="input-register"
            />
            <br />

            {error && (
              <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
            )}
            <br />
            {step === "input" && (
              <div
                className="modal-actions flex-r"
                style={{ justifyContent: "flex-end" }}
              >
                <button
                  disabled={!password}
                  onClick={handleStartDelete}
                  className="form-button"
                  style={{ background: "#e84747" }}
                >
                  Confirm
                </button>
              </div>
            )}
            {step === "confirm" && (
              <div
                className="modal-actions flex-r gap10"
                style={{ justifyContent: "flex-end" }}
              >
                <button
                  className="form-button flex-r center-c"
                  onClick={handleCancel}
                >
                  <FiX style={{ cursor: "pointer" }} />
                  Cancel
                </button>
                <button
                  className="form-button"
                  style={{ background: "#e84747" }}
                >
                  Deleting in {countdown} seconds...
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 3: LOADING */}
        {step === "deleting" && (
          <div style={{ textAlign: "center" }}>
            <p>Deleting account...</p>
            <BeatLoader size={10} />
          </div>
        )}
      </div>
    </div>
  );
}
