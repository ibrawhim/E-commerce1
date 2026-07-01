import { useEffect, useRef, useState } from "react";
import "./Categoryhero.css";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Serif+Display&family=Playfair+Display:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap";

function useFonts() {
  useEffect(() => {
    const id = "catalog-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }, []);
}

function StatItem({ value, label, accent }) {
  return (
    <div className="hero-stat">
      <span className="hero-stat__value" style={{ color: accent }}>{value}</span>
      <span className="hero-stat__label">{label}</span>
    </div>
  );
}

function LayoutShapes({ layout, accent, accentRgb }) {
  if (layout === "tech") {
    return (
      <div className="hero-shapes hero-shapes--tech" aria-hidden="true">
        <div className="tech-ring tech-ring--1" style={{ borderColor: `rgba(${accentRgb},0.15)` }} />
        <div className="tech-ring tech-ring--2" style={{ borderColor: `rgba(${accentRgb},0.08)` }} />
        <div className="tech-ring tech-ring--3" style={{ borderColor: `rgba(${accentRgb},0.04)` }} />
        <div className="tech-dot" style={{ background: accent }} />
        <div className="tech-line tech-line--h" style={{ background: `rgba(${accentRgb},0.12)` }} />
        <div className="tech-line tech-line--v" style={{ background: `rgba(${accentRgb},0.12)` }} />
      </div>
    );
  }
  if (layout === "bold") {
    return (
      <div className="hero-shapes hero-shapes--bold" aria-hidden="true">
        <div className="bold-block bold-block--1" style={{ background: `rgba(${accentRgb},0.06)` }} />
        <div className="bold-block bold-block--2" style={{ background: `rgba(${accentRgb},0.03)` }} />
      </div>
    );
  }
  if (layout === "dark-luxury") {
    return (
      <div className="hero-shapes hero-shapes--luxury" aria-hidden="true">
        <div className="luxury-arc" style={{ borderColor: `rgba(${accentRgb},0.10)` }} />
        <div className="luxury-dot-grid">
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} className="luxury-dot-grid__dot" style={{ background: `rgba(${accentRgb},0.3)` }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="hero-shapes hero-shapes--editorial" aria-hidden="true">
      <div className="editorial-circle" style={{ borderColor: `rgba(${accentRgb},0.08)` }} />
      <div className="editorial-line" style={{ background: `rgba(${accentRgb},0.15)` }} />
    </div>
  );
}

// ─── Main CategoryHero ────────────────────────────────────────────────────────
export default function CategoryHero({ theme, category }) {
  useFonts();

  // We render TWO layers: the outgoing one slides left, the incoming one slides in from right
  const [displayedTheme, setDisplayedTheme] = useState(theme);
  const [displayedCat, setDisplayedCat]     = useState(category);
  const [phase, setPhase]                   = useState("idle"); // idle | exiting | entering
  const timerRef                            = useRef(null);
  const mountedRef                          = useRef(false);

  useEffect(() => {
    // On very first render, just enter
    if (!mountedRef.current) {
      mountedRef.current = true;
      setPhase("entering");
      timerRef.current = setTimeout(() => setPhase("idle"), 500);
      return () => clearTimeout(timerRef.current);
    }

    // Category changed
    if (category !== displayedCat) {
      clearTimeout(timerRef.current);
      setPhase("exiting");
      timerRef.current = setTimeout(() => {
        setDisplayedTheme(theme);
        setDisplayedCat(category);
        setPhase("entering");
        timerRef.current = setTimeout(() => setPhase("idle"), 500);
      }, 360);
    }
    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const lines = displayedTheme.headline.split("\n");

  return (
    <section
      className={`category-hero category-hero--${displayedTheme.layout} hero-phase--${phase}`}
      style={{
        background: displayedTheme.bgGradient,
        "--accent":     displayedTheme.accent,
        "--accent-rgb": displayedTheme.accentRgb,
        "--hero-text":  displayedTheme.text,
        "--hero-sub":   displayedTheme.subText,
        "--hero-font":  displayedTheme.fontFamily,
      }}
    >
      <LayoutShapes layout={displayedTheme.layout} accent={displayedTheme.accent} accentRgb={displayedTheme.accentRgb} />

      <div className="hero-inner">
        <div className="hero-content">
          <p className="hero-tagline">
            <span className="hero-tagline__bar" style={{ background: displayedTheme.accent }} />
            {displayedTheme.tagline}
          </p>

          <h2 className="hero-headline" style={{ fontFamily: displayedTheme.fontFamily }}>
            {lines.map((line, i) => (
              <span key={i} className="hero-headline__line" style={{ animationDelay: `${0.06 + i * 0.1}s` }}>
                {line}
              </span>
            ))}
          </h2>

          <p className="hero-sub">{displayedTheme.sub}</p>

          <div className="hero-cta">
            <button
              className="hero-cta__btn"
              style={{
                background: displayedTheme.accent,
                color: "#fff",
                fontFamily: displayedTheme.fontFamily,
              }}
            >
              {displayedTheme.pill}
            </button>
            <button
              className="hero-cta__ghost"
              style={{ borderColor: displayedTheme.accent, color: displayedTheme.accent }}
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <StatItem value={displayedTheme.stat1.value} label={displayedTheme.stat1.label} accent={displayedTheme.accent} />
          <div className="hero-stats__divider" style={{ background: `rgba(${displayedTheme.accentRgb},0.2)` }} />
          <StatItem value={displayedTheme.stat2.value} label={displayedTheme.stat2.label} accent={displayedTheme.accent} />
          <div className="hero-stats__divider" style={{ background: `rgba(${displayedTheme.accentRgb},0.2)` }} />
          <StatItem value={displayedTheme.stat3.value} label={displayedTheme.stat3.label} accent={displayedTheme.accent} />
        </div>
      </div>

      <div
        className="hero-watermark"
        style={{ fontFamily: displayedTheme.fontFamily, color: `rgba(${displayedTheme.accentRgb},0.06)` }}
      >
        {displayedCat === "all" ? "All" : displayedCat.replace(/-/g, " ")}
      </div>
    </section>
  );
}