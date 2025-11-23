import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./LoginPage.css";
import Line from "../utils/line";
import { BeatLoader } from "react-spinners";
import { saveAuth } from "../utils/auth"; // ⬅️ NEW

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const server = process.env.REACT_APP_SERVER;

  const validateEmail = (value) => {
    setEmail(value);
    // add validation later if needed
  };

  const validatePassword = (value) => {
    setPassword(value);
    if (!value) {
      setPasswordError("Password is required");
    } else if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
    } else {
      setPasswordError("");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async () => {
    if (emailError || passwordError || !email || !password) {
      alert("Please fix the errors before logging in.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${server}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(data.msg || "Login failed");
      }

      // ✅ Use helper to save token + user
      saveAuth(data.token, data.user);

      navigate("/home");
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateEmail(email);
    validatePassword(password);
    if (!emailError && !passwordError) {
      handleLogin();
    }
  };

  const handleNavigateToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      <div className="logo-login flex-c center">
        {/* <BrandLogo /> */}
        <img className="logo-png" src="logo.png" />
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
        {/* Wrap inputs in a form so Enter triggers submit */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              placeholder="Email Address"
              onChange={(e) => validateEmail(e.target.value)}
              className="input-register"
              autoComplete="email"
            />
            <br />
            {emailError && <p className="error-text">{emailError}</p>}
          </div>

          <div
            className="form-group password-group"
            style={{ position: "relative" }}
          >
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Password"
              onChange={(e) => validatePassword(e.target.value)}
              className="input-register"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="eye-button"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                padding: 4,
                cursor: "pointer",
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {passwordError && <p className="error-text">{passwordError}</p>}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? <BeatLoader size={10} /> : "Login"}
          </button>
        </form>

        <div className="link-buttons">
          <button
            className="text-button"
            onClick={() => navigate("/forgot-password")}
          >
            Forgotten Password?
          </button>
        </div>

        <Line length={300} size={1} transparency={0.2} center="true" />

        <div className="placing-login">
          <button
            className="register-button"
            onClick={handleNavigateToRegister}
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
