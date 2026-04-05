import { useState } from "react";
import { loginUser, registerUser } from "../services/api";
import "../styles/AuthPage.css";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "USER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── all logic untouched ──
  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await loginUser(form.email, form.password);
        const stored = {
          email: form.email,
          password: form.password,
          name: form.email.split("@")[0],
        };
        onLogin(stored);
      } else {
        await registerUser(form);
        setMode("login");
        setError("");
        alert("Registered successfully! Please login.");
      }
    } catch (err) {
      setError(
        err.response?.data ||
          "Something went wrong. Check credentials or server.",
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setError("");
    setForm({ name: "", email: "", password: "", phone: "", role: "USER" });
    setMode(mode === "login" ? "register" : "login");
  };

  return (
    <div className="auth-root">
      {/* ── LEFT: photo panel ── */}
      <div className="auth-image-panel">
        <div className="auth-image-bg" />
        <div className="auth-image-overlay" />
        <div className="auth-image-content">
          {/* logo top-left */}
          <div className="auth-logo">
            <div className="auth-logo-mark">
              <img
                src="https://img.icons8.com/fluency/48/bank-building.png"
                width="24"
                height="24"
                alt="logo"
              />
            </div>
            <span className="auth-logo-name">LoanSphere</span>
          </div>

          {/* bottom text */}
          <div>
            <h1 className="auth-image-headline">
              Your financial
              <br />
              freedom starts here
            </h1>
            <p className="auth-image-sub">
              Apply for personal loans, track your EMIs,
              <br />
              and manage repayments in one place.
            </p>
            <div className="auth-dots">
              <div className="auth-dot active" />
              <div className="auth-dot" />
              <div className="auth-dot" />
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: form panel ── */}
      <div className="auth-form-panel">
        {/* topbar with switch button */}
        <div className="auth-topbar">
          <button className="auth-topbar-btn" onClick={switchMode}>
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </div>

        <div className="auth-form-center">
          <div className="auth-form-box">
            <h2 className="auth-form-title">
              {mode === "login" ? "Welcome Back!" : "Create your account"}
            </h2>
            <p className="auth-form-subtitle">
              {mode === "login"
                ? "Sign in to your account"
                : "Fill in the details to get started"}
            </p>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-fields">
              {mode === "register" && (
                <div className="auth-field-row">
                  <div className="auth-field">
                    <label>Full Name</label>
                    <input
                      name="name"
                      placeholder="Rahul Sharma"
                      value={form.name}
                      onChange={handle}
                    />
                  </div>
                  <div className="auth-field">
                    <label>Phone</label>
                    <input
                      name="phone"
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={handle}
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label>Your Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="rahul@gmail.com"
                  value={form.email}
                  onChange={handle}
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={handle}
                />
              </div>

              {mode === "register" && (
                <div className="auth-field">
                  <label>Account Type</label>
                  <div className="role-cards">
                    <div
                      className={`role-card ${form.role === "USER" ? "selected" : ""}`}
                      onClick={() => setForm({ ...form, role: "USER" })}
                    >
                      <div className="role-card-icon">
                        <img
                          src="https://img.icons8.com/fluency/48/user-male-circle.png"
                          width="24"
                          height="24"
                          alt="user"
                        />
                      </div>
                      <div className="role-card-title">User</div>
                      <div className="role-card-desc">Apply for loans</div>
                    </div>
                    <div
                      className={`role-card ${form.role === "ADMIN" ? "selected" : ""}`}
                      onClick={() => setForm({ ...form, role: "ADMIN" })}
                    >
                      <div className="role-card-icon">
                        <img
                          src="https://img.icons8.com/fluency/48/admin-settings-male.png"
                          width="24"
                          height="24"
                          alt="admin"
                        />
                      </div>
                      <div className="role-card-title">Admin</div>
                      <div className="role-card-desc">Manage applications</div>
                    </div>
                  </div>
                </div>
              )}

              <button
                className="auth-submit-btn"
                onClick={submit}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : mode === "login" ? (
                  "Login"
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>
              <div className="auth-divider-line" />
            </div>

            <div className="auth-switch-row">
              <button className="auth-switch-btn" onClick={switchMode}>
                {mode === "login" ? "Register" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
