import { useState } from "react";
import api from "../utils/api";
import { FiX, FiEye, FiEyeOff } from "react-icons/fi";
import "./modalcss/RecoveryEmailModal.css";
import { BeatLoader } from "react-spinners";
export default function ChangePasswordModal({ close }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [loader, setLoader] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const updatePassword = async () => {
    setError("");
    setLoader(true);

    if (!oldPassword || !newPassword1 || !newPassword2) {
      setError("All fields required");
      setLoader(false);
      return;
    }

    if (newPassword1 !== newPassword2) {
      setError("Passwords mismatch");
      setLoader(false);
      return;
    }

    if (newPassword1.length < 8 || newPassword1.length > 15) {
      setError("Password must be between 8 and 15 characters");
      setLoader(false);
      return;
    }

    try {
      await api.put("/api/settings/change-password", {
        oldPassword,
        newPassword: newPassword1,
      });

      alert("Password updated successfully");

      close();
    } catch (err) {
      setError(err.response?.data?.msg || "Old password is wrong");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="settings-options">
          {/* close button */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>Change Password</h3>
            <FiX style={{ cursor: "pointer" }} onClick={close} />
          </div>

          {/* OLD PASSWORD */}
          <input
            type="password"
            placeholder="Old password"
            className="input-register"
            autoComplete="new-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          {/* NEW PASSWORD */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              className="input-register"
              value={newPassword1}
              onChange={(e) => setNewPassword1(e.target.value)}
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          {/* CONFIRM PASSWORD */}
          <input
            type="password"
            placeholder="Confirm new password"
            className="input-register"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
          />

          {/* ERROR MESSAGE */}
          {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}

          <button
            style={{ marginTop: "15px" }}
            onClick={updatePassword}
            className="form-button"
          >
            {loader ? (
              <BeatLoader size={10} color="#FFFFFF" />
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
