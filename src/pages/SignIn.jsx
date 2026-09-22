import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../config/api.js";
import { useAuth } from "../context/useAuth";
import "./Auth.css";

function EyeIcon({ open }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

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
        const msg =
          response.data?.message ||
          response.data?.msg ||
          "Sign in failed.";

        setError(msg);
      } else {
        const userData = response.data?.data;
        const token = response.data?.token;
        const msg =
          response.data?.message ||
          "Login Successful";

        login(userData, token);

        setSuccess(msg);

        setTimeout(() => {
          navigate("/");
        }, 1200);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.msg ||
        err.message ||
        "Sign in failed. Please try again.";

      console.error(
        "Sign In error:",
        err.response?.data || err.message
      );

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(response) {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const backendResponse = await api.post("/google/auth", {
        credential: response.credential,
        mode: "signin"
      });

      const userData = backendResponse.data?.data;
      const token = backendResponse.data?.token;
      const message =
        backendResponse.data?.message ||
        "Signed in with Google successfully.";

      if (!userData || !token) {
        setError("Google sign in failed. Invalid server response.");
        return;
      }

      login(userData, token);
      setSuccess(message);

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.msg ||
        err.message ||
        "Google sign in failed. Please try again.";

      console.error(
        "Google Sign In error:",
        err.response?.data || err.message
      );

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      !window.google ||
      !googleButtonRef.current ||
      !import.meta.env.VITE_GOOGLE_CLIENT_ID
    ) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential
    });

    googleButtonRef.current.innerHTML = "";

    window.google.accounts.id.renderButton(
      googleButtonRef.current,
      {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "continue_with",
        shape: "rectangular"
      }
    );
  }, []);

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-left__inner">
          <div className="auth-left__body">
            <p className="auth-left__tagline">Welcome back</p>

            <h1 className="auth-left__headline">
              Sign in to
              <br />
              your account
            </h1>

            <p className="auth-left__sub">
              Access your orders, saved items and personalised recommendations.
            </p>
          </div>

          <div className="auth-left__stat-row">
            {[
              ["50k+", "Products"],
              ["4.8★", "Avg Rating"],
              ["Free", "Returns"]
            ].map(([value, label]) => (
              <div key={label} className="auth-left__stat">
                <span className="auth-left__stat-val">
                  {value}
                </span>

                <span className="auth-left__stat-label">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card__title">
            Sign In
          </h2>

          <p className="auth-card__sub">
            Enter your details to continue
          </p>

          <div
            ref={googleButtonRef}
            className="auth-google-container"
          />

          <div className="auth-divider">
            <span />
            <p>or sign in with email</p>
            <span />
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="auth-field">
              <label className="auth-field__label">
                Email address
              </label>

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
                <label className="auth-field__label">
                  Password
                </label>

                <a
                  href="#"
                  className="auth-field__link"
                >
                  Forgot password?
                </a>
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
                  onClick={() =>
                    setShowPassword((value) => !value)
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

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="auth-card__footer">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="auth-card__footer-link"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}