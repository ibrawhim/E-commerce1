import "./Footer.css";

const LINKS = {
  Shop: ["All Products", "Beauty", "Electronics", "Fashion", "Furniture", "Groceries"],
  Company: ["About Us", "Careers", "Press", "Blog", "Contact"],
  Support: ["Help Center", "Track Order", "Returns", "Shipping Info", "Size Guide"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <a href="/" className="footer__logo">
            <span className="footer__logo-mark">B</span>
            <span className="footer__logo-text">commerce</span>
          </a>
          <p className="footer__tagline">
            Curated products from every category, delivered to your door.
          </p>
          <div className="footer__socials">
            {["Twitter", "Instagram", "Facebook", "YouTube"].map((s) => (
              <a key={s} href="#" className="footer__social" aria-label={s}>
                {s[0]}
              </a>
            ))}
          </div>
        </div>

        <div className="footer__links">
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group} className="footer__col">
              <h4 className="footer__col-title">{group}</h4>
              <ul className="footer__col-list">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="footer__col-link">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <p className="footer__copy">© {new Date().getFullYear()} Bcommerce. All rights reserved..</p>
          <div className="footer__payments">
            {["Visa", "Mastercard", "PayPal", "Apple Pay"].map((p) => (
              <span key={p} className="footer__payment-tag">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}