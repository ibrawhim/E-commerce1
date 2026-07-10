import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home",       to: "/" },
  { label: "Shop",       to: "/" },
  { label: "Categories", to: "/" },
  { label: "Deals",      to: "/" },
  { label: "About",      to: "/" },
];

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      className="navbar__theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span className={`navbar__theme-track ${isDark ? "navbar__theme-track--dark" : ""}`}>
        <span className="navbar__theme-thumb">
          {isDark ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1"     x2="12" y2="3"/>
              <line x1="12" y1="21"    x2="12" y2="23"/>
              <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1"  y1="12"    x2="3"  y2="12"/>
              <line x1="21" y1="12"    x2="23" y2="12"/>
              <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="navbar__user" ref={ref}>
      <button
        className="navbar__user-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="User menu"
      >
        <span className="navbar__user-avatar">{initials}</span>
        <span className="navbar__user-name">{user.firstName}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="navbar__user-dropdown">
          <div className="navbar__user-dropdown-header">
            <p className="navbar__user-dropdown-name">{user.firstName} {user.lastName}</p>
            <p className="navbar__user-dropdown-email">{user.email}</p>
          </div>
          <div className="navbar__user-dropdown-divider" />
          <Link to="/"      className="navbar__user-dropdown-item" onClick={() => setOpen(false)}>My Orders</Link>
          <Link to="/"      className="navbar__user-dropdown-item" onClick={() => setOpen(false)}>Profile</Link>
          <Link to="/cart"  className="navbar__user-dropdown-item" onClick={() => setOpen(false)}>My Cart</Link>
          <div className="navbar__user-dropdown-divider" />
          <button
            className="navbar__user-dropdown-item navbar__user-dropdown-item--logout"
            onClick={() => { setOpen(false); onLogout(); }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems }          = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { user, isLoggedIn, logout } = useAuth();
  const navigate                = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark">B</span>
          <span className="navbar__logo-text">commerce</span>
        </Link>

        <nav className={`navbar__nav ${menuOpen ? "navbar__nav--open" : ""}`}>
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className="navbar__link" onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          {!isLoggedIn && (
            <div className="navbar__nav-auth">
              <Link to="/signin" className="navbar__btn navbar__btn--ghost" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/signup" className="navbar__btn navbar__btn--solid" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
          {isLoggedIn && (
            <div className="navbar__nav-auth">
              <button className="navbar__btn navbar__btn--ghost" onClick={() => { setMenuOpen(false); handleLogout(); }}>
                Sign Out
              </button>
            </div>
          )}
        </nav>

        <div className="navbar__actions">
          <button className="navbar__icon-btn" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          <Link to="/cart" className="navbar__icon-btn navbar__cart-link" aria-label="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span className="navbar__cart-badge">{totalItems > 99 ? "99+" : totalItems}</span>
            )}
          </Link>

          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

          {isLoggedIn ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <div className="navbar__auth-desktop">
              <Link to="/signin" className="navbar__btn navbar__btn--ghost">Sign In</Link>
              <Link to="/signup" className="navbar__btn navbar__btn--solid">Sign Up</Link>
            </div>
          )}

          <button
            className={`navbar__hamburger ${menuOpen ? "navbar__hamburger--open" : ""}`}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {menuOpen && <div className="navbar__overlay" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}