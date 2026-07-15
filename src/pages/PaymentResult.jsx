import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../config/api.js";
import { useCart } from "../context/useCart";
import "./PaymentResult.css";

export default function PaymentResult() {
  const [searchParams]          = useSearchParams();
  const { clearCart }           = useCart();
  const [status, setStatus]     = useState("verifying");
  const [data, setData]         = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setErrorMsg("No payment reference found. Please contact support.");
      return;
    }

    const token   = localStorage.getItem("token");
    let shippingAddress = {};
    try {
      const stored = sessionStorage.getItem("bcommerce-shipping");
      if (stored) shippingAddress = JSON.parse(stored);
    } catch {}

    const payload = { reference, shippingAddress };
    console.log("Verifying payment — payload:", payload);

    api
      .post("/payment/verify", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((response) => {
        console.log("Payment verify response:", response.data);
        if (response.data?.success) {
          setData(response.data);
          setStatus("success");
          clearCart();
          sessionStorage.removeItem("bcommerce-shipping");
        } else {
          setStatus("failed");
          setErrorMsg(
            response.data?.message ||
            response.data?.msg     ||
            "Payment could not be verified."
          );
        }
      })
      .catch((err) => {
        console.error("Verify error:", err.response?.data || err.message);
        setStatus("failed");
        setErrorMsg(
          err.response?.data?.message ||
          err.response?.data?.msg     ||
          err.message                 ||
          "Something went wrong verifying your payment."
        );
      });
  }, [reference]);

  if (status === "verifying") {
    return (
      <div className="pr-root">
        <div className="pr-verifying">
          <div className="pr-spinner" />
          <p className="pr-verifying__text">Verifying your payment…</p>
          <p className="pr-verifying__sub">Please don't close this page.</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="pr-root">
        <div className="pr-card">
          <div className="pr-icon pr-icon--error">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>

          <h1 className="pr-title pr-title--error">Payment Failed</h1>
          <p className="pr-sub">{errorMsg}</p>

          {reference && (
            <div className="pr-reference">
              <span className="pr-reference__label">Reference</span>
              <span className="pr-reference__value">{reference}</span>
            </div>
          )}

          <div className="pr-actions">
            <Link to="/checkout" className="pr-btn pr-btn--primary">Try Again</Link>
            <Link to="/cart"     className="pr-btn pr-btn--ghost">Back to Cart</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-root">
      <div className="pr-card">
        <div className="pr-confetti" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="pr-confetti__piece" style={{ "--i": i }} />
          ))}
        </div>

        <div className="pr-icon pr-icon--success">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <h1 className="pr-title">Payment Successful!</h1>
        <p className="pr-sub">
          Thank you for your order. We've received your payment and will process your order shortly.
        </p>

        {reference && (
          <div className="pr-reference">
            <span className="pr-reference__label">Reference</span>
            <span className="pr-reference__value">{reference}</span>
          </div>
        )}

        {(data?.totalItems || data?.totalPrice) && (
          <div className="pr-summary">
            {data?.totalItems && (
              <div className="pr-summary__row">
                <span>Items ordered</span>
                <span>{data.totalItems}</span>
              </div>
            )}
            {data?.totalPrice && (
              <div className="pr-summary__row">
                <span>Total paid</span>
                <span>${Number(data.totalPrice).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        <div className="pr-steps">
          {[
            { icon: "✓", label: "Payment confirmed",      active: true  },
            { icon: "📦", label: "Order being processed",  active: false },
            { icon: "🚚", label: "Delivery on the way",    active: false },
          ].map(({ icon, label, active }) => (
            <div key={label} className="pr-step">
              <span className={`pr-step__icon ${active ? "pr-step__icon--active" : ""}`}>
                {icon}
              </span>
              <span className="pr-step__label">{label}</span>
            </div>
          ))}
        </div>

        <div className="pr-actions">
          <Link to="/" className="pr-btn pr-btn--primary">Continue Shopping</Link>
          <Link to="/" className="pr-btn pr-btn--ghost">View Orders</Link>
        </div>
      </div>
    </div>
  );
}