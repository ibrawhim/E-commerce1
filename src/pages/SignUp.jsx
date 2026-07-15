import { useState } from "react";
import { api } from "../config/api.js";
import { useSignUpForm } from "../hooks/useSignUpForm";
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

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export default function SignUp() {
  const {
    values, errors, touched,
    showPassword, setShowPassword,
    handleChange, handleBlur,
    passwordRules, showRules,
    isFormValid, getPayload, reset,
  } = useSignUpForm();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/signup", getPayload());
      console.log("Sign Up response:", response.data);

      if (response.data?.status === false) {
        setError(response.data?.message || response.data?.msg || "Sign up failed.");
      } else {
        const msg = response.data?.message || response.data?.msg || "Account created successfully!";
        setSuccess(msg);
        reset();
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        err.response?.data?.msg     ||
        err.message                 ||
        "Sign up failed. Please try again.";
      console.error("Sign Up error:", err.response?.data || err.message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignUp() {
    console.log("Sign up with Google clicked");
  }

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-left__inner">
          <div className="auth-left__body">
            <p className="auth-left__tagline">Join thousands of shoppers</p>
            <h1 className="auth-left__headline">Create your<br />free account</h1>
            <p className="auth-left__sub">
              Unlock exclusive deals, track your orders and discover products curated just for you.
            </p>
          </div>
          <div className="auth-left__perks">
            {[
              ["✦", "Free shipping on orders over $50"],
              ["✦", "Exclusive member-only discounts"],
              ["✦", "Easy 30-day returns"],
              ["✦", "Real-time order tracking"],
            ].map(([icon, text]) => (
              <div key={text} className="auth-perk">
                <span className="auth-perk__icon">{icon}</span>
                <span className="auth-perk__text">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card__title">Create Account</h2>
          <p className="auth-card__sub">Start shopping in seconds</p>

          <button type="button" className="auth-google-btn" onClick={handleGoogleSignUp}>
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
            <p>or sign up with email</p>
            <span />
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field-row">
              <div className="auth-field">
                <label className="auth-field__label">First name</label>
                <input
                  type="text"
                  name="firstName"
                  className={`auth-field__input ${touched.firstName && errors.firstName ? "auth-field__input--error" : ""}`}
                  placeholder="Ibrahim"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.firstName && errors.firstName && (
                  <span className="auth-field__error">{errors.firstName}</span>
                )}
              </div>
              <div className="auth-field">
                <label className="auth-field__label">Last name</label>
                <input
                  type="text"
                  name="lastName"
                  className={`auth-field__input ${touched.lastName && errors.lastName ? "auth-field__input--error" : ""}`}
                  placeholder="Yusuf"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.lastName && errors.lastName && (
                  <span className="auth-field__error">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-field__label">Email address</label>
              <input
                type="email"
                name="email"
                className={`auth-field__input ${touched.email && errors.email ? "auth-field__input--error" : ""}`}
                placeholder="you@example.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.email && errors.email && (
                <span className="auth-field__error">{errors.email}</span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-field__label">Password</label>
              <div className="auth-field__input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`auth-field__input auth-field__input--has-icon ${touched.password && errors.password ? "auth-field__input--error" : ""}`}
                  placeholder="Min. 8 characters"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
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

              <ul className="auth-password-rules">
                {passwordRules.map((rule) => (
                  <li
                    key={rule.id}
                    className={`auth-password-rule ${
                      rule.passed
                        ? "auth-password-rule--pass"
                        : values.password.length > 0
                        ? "auth-password-rule--fail"
                        : "auth-password-rule--pending"
                    }`}
                  >
                    <span className="auth-password-rule__icon">
                      {rule.passed ? <CheckIcon /> : <XIcon />}
                    </span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>

            {error   && <p className="auth-error">{error}</p>}
            {success && <p className="auth-success">{success}</p>}

            {!isFormValid && (
              <p className="auth-submit-hint">
                {!values.firstName.trim() || !values.lastName.trim()
                  ? "Please fill in your first and last name."
                  : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
                  ? "Please enter a valid email address."
                  : !passwordValid
                  ? "Password must meet all 3 requirements above."
                  : "Please complete all fields to continue."}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || !isFormValid}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="auth-card__footer">
            Already have an account?{" "}
            <a href="/signin" className="auth-card__footer-link">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}