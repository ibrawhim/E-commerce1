import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getOrders } from "../config/orders";
import "./OrderSuccess.css";

// Landed on after POST /payment/verify succeeds. The backend has already
// created the order at this point — we just fetch the latest orders and
// surface the newest one.
export default function OrderSuccess() {
  const location = useLocation();
  const reference = location.state?.reference || "";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      setLoading(true);
      setError("");
      try {
        const data = await getOrders();
        const list = Array.isArray(data) ? data : data.orders || [];
        if (!cancelled) setOrders(list);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            err.response?.data?.msg ||
            err.message ||
            "Failed to load your orders."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const latestOrder = orders[0];

  return (
    <div className="os-root">
      <div className="os-card">
        <div className="os-confetti" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="os-confetti__piece" style={{ "--i": i }} />
          ))}
        </div>

        <div className="os-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1 className="os-title">Payment Successful!</h1>
        <p className="os-sub">Thank you — your order has been placed and is being processed.</p>

        {reference && (
          <div className="os-reference">
            <span className="os-reference__label">Reference</span>
            <span className="os-reference__value">{reference}</span>
          </div>
        )}

        {loading && <p className="os-status">Loading your order...</p>}
        {error && <p className="os-error">{error}</p>}

        {!loading && !error && latestOrder && (
          <div className="os-summary">
            <div className="os-summary__row">
              <span>Order</span>
              <span>#{latestOrder._id?.slice(-8)}</span>
            </div>
            {(latestOrder.totalAmount ?? latestOrder.totalPrice) != null && (
              <div className="os-summary__row">
                <span>Total</span>
                <span>${Number(latestOrder.totalAmount ?? latestOrder.totalPrice).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        <div className="os-actions">
          {latestOrder && (
            <Link to={`/orders/${latestOrder._id}`} className="os-btn os-btn--primary">
              View Order
            </Link>
          )}
          <Link to="/orders" className="os-btn os-btn--ghost">My Orders</Link>
          <Link to="/" className="os-btn os-btn--ghost">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}