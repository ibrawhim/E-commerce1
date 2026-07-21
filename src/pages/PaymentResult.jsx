import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../config/api.js";
import { useCart } from "../context/useCart";
import "./PaymentResult.css";

export default function PaymentResult() {
  const [searchParams]          = useSearchParams();
  const { clearCart }           = useCart();
  const navigate                = useNavigate();
  const [status, setStatus]     = useState("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setErrorMsg("No payment reference found. Please contact support.");
      return;
    }

    const token = localStorage.getItem("token");

    // The backend now loads the user's saved address itself and copies it
    // into the order — we only send the payment reference here.
    const payload = { reference };
    console.log("Verifying payment — payload:", JSON.stringify(payload, null, 2));

    api
      .post("/payment/verify", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((response) => {
        console.log("Payment verify response:", response.data);
        if (response.data?.success) {
          clearCart();
          // The backend has created the order — hand off to the Order
          // Success page, which fetches GET /orders for the latest one.
          navigate("/order-success", { state: { reference }, replace: true });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // status === "failed"
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