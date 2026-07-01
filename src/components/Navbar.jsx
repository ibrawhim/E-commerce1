import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/" },
  { label: "Categories", to: "/" },
  { label: "Deals", to: "/" },
  { label: "About", to: "/" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();

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
          <div className="navbar__nav-auth">
            <Link to="/signin" className="navbar__btn navbar__btn--ghost" onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link to="/signup" className="navbar__btn navbar__btn--solid" onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </div>
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

          <div className="navbar__auth-desktop">
            <Link to="/signin" className="navbar__btn navbar__btn--ghost">Sign In</Link>
            <Link to="/signup" className="navbar__btn navbar__btn--solid">Sign Up</Link>
          </div>

          <button
            className={`navbar__hamburger ${menuOpen ? "navbar__hamburger--open" : ""}`}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {menuOpen && <div className="navbar__overlay" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}