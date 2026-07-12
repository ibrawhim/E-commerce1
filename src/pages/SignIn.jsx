import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../config/api.js";
import { useAuth } from "../context/useAuth";
import "./Auth.css";

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function SignIn() {
  const { login }                       = useAuth();
  const navigate                        = useNavigate();
  const [formData, setFormData]         = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await api.post("/signin", formData);
      console.log("Sign In response:", response.data);

      if (response.data?.status === false) {
        const msg = response.data?.message || response.data?.msg || "Sign in failed.";
        setError(msg);
      } else {
        const userData = response.data?.data;
        const token    = response.data?.token;
        const msg      = response.data?.message || "Login Successful";
        login(userData, token);
        setSuccess(msg);
        setTimeout(() => navigate("/"), 1200);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        err.response?.data?.msg     ||
        err.message                 ||
        "Sign in failed. Please try again.";
      console.error("Sign In error:", err.response?.data || err.message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    console.log("Sign in with Google clicked");
  }

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-left__inner">
          <div className="auth-left__body">
            <p className="auth-left__tagline">Welcome back</p>
            <h1 className="auth-left__headline">Sign in to<br />your account</h1>
            <p className="auth-left__sub">
              Access your orders, saved items and personalised recommendations.
            </p>
          </div>
          <div className="auth-left__stat-row">
            {[["50k+", "Products"], ["4.8★", "Avg Rating"], ["Free", "Returns"]].map(([v, l]) => (
              <div key={l} className="auth-left__stat">
                <span className="auth-left__stat-val">{v}</span>
                <span className="auth-left__stat-label">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card__title">Sign In</h2>
          <p className="auth-card__sub">Enter your details to continue</p>

          <button type="button" className="auth-google-btn" onClick={handleGoogleSignIn}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">
            <span />
            <p>or sign in with email</p>
            <span />
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-field__label">Email address</label>
              <input
                type="email"
                name="email"
                className="auth-field__input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <div className="auth-field__row">
                <label className="auth-field__label">Password</label>
                <a href="#" className="auth-field__link">Forgot password?</a>
              </div>
              <div className="auth-field__input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="auth-field__input auth-field__input--has-icon"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-field__eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {error   && <p className="auth-error">{error}</p>}
            {success && <p className="auth-success">{success}</p>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="auth-card__footer">
            Don't have an account?{" "}
            <a href="/signup" className="auth-card__footer-link">Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}