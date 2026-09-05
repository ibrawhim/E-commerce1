import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { api } from "../config/api.js";
import "./Profile.css";

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

export default function Profile() {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError]     = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", bio: "",
  });

  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword]         = useState("");
  const [pwError, setPwError]           = useState("");
  const [pwSuccess, setPwSuccess]       = useState("");
  const [pwSaving, setPwSaving]         = useState(false);

  const [becomingSeller, setBecomingSeller]         = useState(false);
  const [becomeSellerError, setBecomeSellerError]   = useState("");
  const [becomeSellerSuccess, setBecomeSellerSuccess] = useState("");

  function getHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  useEffect(() => {
    setFetchLoading(true);
    setFetchError("");
    api
      .get("/profile", { headers: getHeaders() })
      .then((res) => {
        console.log("GET /profile response:", res.data);
        const data = res.data?.data || res.data?.profile || res.data;
        setProfile(data);
        setForm({
          firstName: data.firstName || "",
          lastName:  data.lastName  || "",
          email:     data.email     || "",
          phone:     data.phone     || "",
          bio:       data.bio       || "",
        });
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.msg     ||
          err.message                 ||
          "Could not load profile.";
        setFetchError(msg);
      })
      .finally(() => setFetchLoading(false));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaveError("");
    setSaveSuccess("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const res = await api.patch("/profile", form, { headers: getHeaders() });
      console.log("PATCH /profile response:", res.data);

      if (res.data?.success === false) {
        setSaveError(res.data?.message || "Update failed.");
      } else {
        const updatedData = res.data?.data || res.data?.profile || res.data;
        const newToken    = res.data?.token;

        setProfile(updatedData);

        if (newToken) {
          localStorage.setItem("token", newToken);
          console.log("Token refreshed in localStorage.");
        }

        login(updatedData, newToken || localStorage.getItem("token"));
        setSaveSuccess(res.data?.message || "Profile updated successfully.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.msg     ||
        err.message                 ||
        "Update failed. Please try again.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleBecomeSeller() {
    setBecomingSeller(true);
    setBecomeSellerError("");
    setBecomeSellerSuccess("");

    try {
      const res = await api.patch("/become-seller", {}, { headers: getHeaders() });
      console.log("PATCH /become-seller response:", res.data);

      if (res.data?.success === false) {
        setBecomeSellerError(res.data?.message || "Could not complete seller registration.");
        return;
      }

      const updatedData = res.data?.data || res.data?.profile || res.data;
      const newToken     = res.data?.token;

      // Merge whatever the backend gives back (at minimum the role should
      // change) into the current profile rather than assuming a full
      // profile object comes back.
      const mergedProfile = updatedData ? { ...profile, ...updatedData } : { ...profile, role: "Seller" };
      setProfile(mergedProfile);

      if (newToken) {
        localStorage.setItem("token", newToken);
        console.log("Token refreshed in localStorage.");
      }

      login(mergedProfile, newToken || localStorage.getItem("token"));
      setBecomeSellerSuccess(res.data?.message || "You're now a seller!");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.msg     ||
        err.message                 ||
        "Failed to become a seller. Please try again.";
      setBecomeSellerError(msg);
    } finally {
      setBecomingSeller(false);
    }
  }

  const isSeller = (profile?.role || "").toLowerCase() === "seller";

  const initials = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : "??";

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "—";

  if (fetchLoading) {
    return (
      <div className="profile-root">
        <div className="profile-state">
          <div className="profile-spinner" />
          <p>Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="profile-root">
        <div className="profile-state profile-state--error">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8"  x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-root">
      <div className="profile-header">
        <div className="profile-header__inner">
          <h1 className="profile-header__title">My Profile</h1>
          <p className="profile-header__sub">Manage your account information</p>
        </div>
      </div>

      <div className="profile-body">
        <div className="profile-sidebar">
          <div className="profile-avatar-card">
            <div className="profile-avatar">{initials}</div>
            <p className="profile-avatar__name">
              {profile?.firstName} {profile?.lastName}
            </p>
            <p className="profile-avatar__email">{profile?.email}</p>
            {profile?.role && (
              <span className="profile-avatar__role">{profile.role}</span>
            )}
            <p className="profile-avatar__since">Member since {memberSince}</p>
          </div>

          <div className="profile-seller-card">
            <div className="profile-seller-card__row">
              <div>
                <h3 className="profile-seller-card__title">Sell on Bcommerce</h3>
                <p className="profile-seller-card__desc">
                  {isSeller
                    ? "You're registered as a seller on this account."
                    : "Start listing your own products and reach thousands of shoppers."}
                </p>
              </div>
              <button
                type="button"
                className={`profile-seller-toggle ${isSeller ? "profile-seller-toggle--on" : ""}`}
                role="switch"
                aria-checked={isSeller}
                aria-label={isSeller ? "Seller account enabled" : "Become a seller"}
                onClick={handleBecomeSeller}
                disabled={isSeller || becomingSeller}
              >
                <span className="profile-seller-toggle__thumb">
                  {becomingSeller && <span className="profile-seller-toggle__spinner" />}
                </span>
              </button>
            </div>

            {becomeSellerError && <p className="profile-error">{becomeSellerError}</p>}
            {becomeSellerSuccess && <p className="profile-success">{becomeSellerSuccess}</p>}
          </div>

          <div className="profile-quick-links">
            <a href="/orders" className="profile-quick-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
              </svg>
              My Orders
            </a>
            <a href="/cart" className="profile-quick-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              My Cart
            </a>
          </div>
        </div>

        <div className="profile-main">
          <form className="profile-section" onSubmit={handleSave} noValidate>
            <h2 className="profile-section__title">Personal Information</h2>

            <div className="profile-field-row">
              <div className="profile-field">
                <label className="profile-field__label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="profile-field__input"
                  value={form.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                />
              </div>
              <div className="profile-field">
                <label className="profile-field__label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="profile-field__input"
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-field__label">Email Address</label>
              <input
                type="email"
                name="email"
                className="profile-field__input"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="profile-field">
              <label className="profile-field__label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="profile-field__input"
                value={form.phone}
                onChange={handleChange}
                placeholder="+234 800 000 0000"
                autoComplete="tel"
              />
            </div>

            <div className="profile-field">
              <label className="profile-field__label">Bio</label>
              <textarea
                name="bio"
                className="profile-field__input profile-field__textarea"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us a little about yourself…"
                rows={3}
              />
            </div>

            {saveError   && <p className="profile-error">{saveError}</p>}
            {saveSuccess && <p className="profile-success">{saveSuccess}</p>}

            <div className="profile-actions">
              <button
                type="submit"
                className="profile-save-btn"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}