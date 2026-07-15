import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/useCart";
import "./PaymentSuccess.css";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart }  = useCart();

  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="ps-root">
      <div className="ps-card">
        <div className="ps-confetti" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="ps-confetti__piece" style={{ "--i": i }} />
          ))}
        </div>

        <div className="ps-icon ps-icon--success">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <h1 className="ps-title">Payment Successful!</h1>
        <p className="ps-sub">
          Thank you for your order. We've received your payment and will process your order shortly.
        </p>

        {reference && (
          <div className="ps-reference">
            <span className="ps-reference__label">Reference</span>
            <span className="ps-reference__value">{reference}</span>
          </div>
        )}

        <div className="ps-steps">
          {[
            { icon: "✓", label: "Payment confirmed",     active: true  },
            { icon: "📦", label: "Order being processed", active: false },
            { icon: "🚚", label: "Delivery on the way",   active: false },
          ].map(({ icon, label, active }) => (
            <div key={label} className="ps-step">
              <span className={`ps-step__icon ${active ? "ps-step__icon--active" : ""}`}>
                {icon}
              </span>
              <span className="ps-step__label">{label}</span>
            </div>
          ))}
        </div>

        <div className="ps-actions">
          <Link to="/" className="ps-btn ps-btn--primary">Continue Shopping</Link>
          <Link to="/" className="ps-btn ps-btn--ghost">View Orders</Link>
        </div>
      </div>
    </div>
  );
}