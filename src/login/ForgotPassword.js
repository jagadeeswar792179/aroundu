import React, { useState } from "react";
import axios from "axios";
import OtpInput from "../utils/OtpInput"; // your existing OTP component
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const server = process.env.REACT_APP_SERVER;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [resetlooading, setresetlooading] = useState(false);

  const sendOtp = async () => {
    if (!email) return alert("Enter your email first");

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${server}/api/forgot-password/send-otp`,
        { email }
      );
      setLoading(false);
      alert(data.msg);
      setOtpSent(true);
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.msg || "Error sending OTP");
    }
  };
  const validatePassword1 = (value) => {
    setNewPassword(value);
    if (!value) {
      setPasswordError("Password is required");
    } else if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
    } else {
      setPasswordError("");
    }
  };
  const validatePassword2 = (value) => {
    setNewPassword2(value);
    if (!value) {
      setPasswordError("Password is required");
    } else if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
    } else {
      setPasswordError("");
    }
  };
  const verifyOtp = async () => {
    try {
      const { data } = await axios.post(
        `${server}/api/forgot-password/verify-otp`,
        { email, otp: otpValue }
      );
      if (data.verified) {
        setOtpVerified(true);
        alert("OTP verified! Now set your new password.");
      } else {
        alert(data.msg);
      }
    } catch (err) {
      alert("Error verifying OTP");
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 8)
      return alert("Enter a valid password");

    try {
      // call your password reset API
      await axios.post(`${server}/api/auth/reset-password`, {
        email,
        password: newPassword,
        confirmPassword: newPassword2,
      });
      setresetlooading(false);
      alert("Password reset successfully!");
      navigate("/");
    } catch (err) {
      alert("Error resetting password");
    }
  };
  const verifyPassword = async () => {
    setresetlooading(true);
    if (newPassword !== newPassword2) {
      alert("password must be same");
    } else {
      resetPassword();
    }
  };

  return (
    <div className="login-container">
      <div className="logo-login">
        <p>
          Around
          <span>U</span>
        </p>
        <p>
          AroundU helps you connect and share
          <br /> with the people in your life.
        </p>
      </div>

      <div className="login-box">
        <div className="forgot-password-container">
          {!otpSent ? (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                className="input-register"
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={sendOtp}
                disabled={loading}
                className="register-button"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          ) : !otpVerified ? (
            <>
              <OtpInput length={6} value={otpValue} onChange={setOtpValue} />
              <button onClick={verifyOtp} className="register-button">
                Verify OTP
              </button>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  className="input-register"
                  onChange={(e) => {
                    validatePassword1(e.target.value);
                  }}
                  s
                />

                <input
                  type="password"
                  placeholder="Retype New Password"
                  value={newPassword2}
                  className="input-register"
                  onChange={(e) => validatePassword2(e.target.value)}
                />
                {passwordError && <p className="error-text">{passwordError}</p>}
              </div>

              <button onClick={verifyPassword} className="register-button">
                {!resetlooading ? "Reset Password" : "Resetting..."}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
