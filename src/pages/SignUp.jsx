import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../config/api.js";
import { useAuth } from "../context/useAuth";
import { useSignUpForm } from "../hooks/useSignUpForm";
import "./Auth.css";

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function SignUp() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const {
    values,
    errors,
    touched,
    showPassword,
    setShowPassword,
    handleChange,
    handleBlur,
    passwordRules,
    passwordValid,
    isFormValid,
    getPayload,
    reset,
    BIO_MAX_LENGTH,
  } = useSignUpForm();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function getHintMessage() {
    if (!values.firstName.trim() || !values.lastName.trim()) {
      return "Please fill in your first and last name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      return "Please enter a valid email address.";
    }

    if (!/^[+]?[\d\s()-]{7,20}$/.test(values.phone.trim())) {
      return "Please enter a valid phone number.";
    }

    if (values.bio.length > BIO_MAX_LENGTH) {
      return `Bio must be ${BIO_MAX_LENGTH} characters or fewer.`;
    }

    if (!passwordValid) {
      return "Password must meet all 3 requirements above.";
    }

    return "Please complete all fields to continue.";
  }

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
        setError(
          response.data?.message ||
          response.data?.msg ||
          "Sign up failed."
        );
      } else {
        const msg =
          response.data?.message ||
          response.data?.msg ||
          "Account created successfully!";

        setSuccess(msg);
        reset();
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.msg ||
        err.message ||
        "Sign up failed. Please try again.";

      console.error(
        "Sign Up error:",
        err.response?.data || err.message
      );

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(response) {
    setGoogleLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await api.post("/google/auth", {
        credential: response.credential,
        mode: "signup",
      });

      console.log("Google Sign Up response:", result.data);

      const userData = result.data?.data;
      const token = result.data?.token;

      if (!userData || !token) {
        throw new Error("Google sign up response is missing account data.");
      }

      login(userData, token);

      setSuccess(
        result.data?.message ||
        "Account created with Google successfully."
      );

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.msg ||
        err.message ||
        "Google sign up failed. Please try again.";

      console.error(
        "Google Sign Up error:",
        err.response?.data || err.message
      );

      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  }

  useEffect(() => {
    if (!window.google || !googleButtonRef.current) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });

    googleButtonRef.current.innerHTML = "";

    window.google.accounts.id.renderButton(
      googleButtonRef.current,
      {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "continue_with",
        shape: "rectangular",
      }
    );
  }, []);

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-left__inner">
          <div className="auth-left__body">
            <p className="auth-left__tagline">
              Join thousands of shoppers
            </p>

            <h1 className="auth-left__headline">
              Create your
              <br />
              free account
            </h1>

            <p className="auth-left__sub">
              Unlock exclusive deals, track your orders and discover products
              curated just for you.
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

          <p className="auth-card__sub">
            Start shopping in seconds
          </p>

          <div
            ref={googleButtonRef}
            className="auth-google-container"
            style={{
              width: "100%",
              minHeight: "40px",
              display: "flex",
              justifyContent: "center",
              pointerEvents: googleLoading ? "none" : "auto",
              opacity: googleLoading ? 0.6 : 1,
            }}
          />

          <div className="auth-divider">
            <span />
            <p>or sign up with email</p>
            <span />
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
          >
            <div className="auth-field-row">
              <div className="auth-field">
                <label className="auth-field__label">
                  First name
                </label>

                <input
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  className={`auth-field__input ${
                    touched.firstName && errors.firstName
                      ? "auth-field__input--error"
                      : ""
                  }`}
                  placeholder="Ibrahim"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                {touched.firstName && errors.firstName && (
                  <span className="auth-field__error">
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-field__label">
                  Last name
                </label>

                <input
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  className={`auth-field__input ${
                    touched.lastName && errors.lastName
                      ? "auth-field__input--error"
                      : ""
                  }`}
                  placeholder="Yusuf"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                {touched.lastName && errors.lastName && (
                  <span className="auth-field__error">
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-field__label">
                Email address
              </label>

              <input
                type="email"
                name="email"
                autoComplete="email"
                className={`auth-field__input ${
                  touched.email && errors.email
                    ? "auth-field__input--error"
                    : ""
                }`}
                placeholder="you@example.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              {touched.email && errors.email && (
                <span className="auth-field__error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-field__label">
                Phone number
              </label>

              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                className={`auth-field__input ${
                  touched.phone && errors.phone
                    ? "auth-field__input--error"
                    : ""
                }`}
                placeholder="+1 (555) 000-0000"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              {touched.phone && errors.phone && (
                <span className="auth-field__error">
                  {errors.phone}
                </span>
              )}
            </div>

            <div className="auth-field">
              <div className="auth-field__row">
                <label className="auth-field__label">
                  Bio (optional)
                </label>

                <span
                  className="auth-field__link"
                  style={{ cursor: "default" }}
                >
                  {values.bio.length}/{BIO_MAX_LENGTH}
                </span>
              </div>

              <textarea
                name="bio"
                rows={3}
                className={`auth-field__input ${
                  touched.bio && errors.bio
                    ? "auth-field__input--error"
                    : ""
                }`}
                style={{
                  height: "auto",
                  padding: "10px 14px",
                  resize: "vertical",
                }}
                placeholder="A little about yourself..."
                value={values.bio}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={BIO_MAX_LENGTH}
              />

              {touched.bio && errors.bio && (
                <span className="auth-field__error">
                  {errors.bio}
                </span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-field__label">
                Password
              </label>

              <div className="auth-field__input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  className={`auth-field__input auth-field__input--has-icon ${
                    touched.password && errors.password
                      ? "auth-field__input--error"
                      : ""
                  }`}
                  placeholder="Min. 8 characters"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                <button
                  type="button"
                  className="auth-field__eye"
                  onClick={() =>
                    setShowPassword((v) => !v)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
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

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            {success && (
              <p className="auth-success">
                {success}
              </p>
            )}

            {!isFormValid && (
              <p className="auth-submit-hint">
                {getHintMessage()}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || !isFormValid}
            >
              {loading
                ? "Creating account…"
                : "Create Account"}
            </button>
          </form>

          <p className="auth-card__footer">
            Already have an account?{" "}
            <a
              href="/signin"
              className="auth-card__footer-link"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}