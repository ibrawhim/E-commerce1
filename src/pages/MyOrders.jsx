import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getOrders } from "../config/orders";
import "./MyOrders.css";

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Adjust these lookups if your actual /orders response uses different field
// names — this covers the common shapes without assuming one exact schema.
function getItemCount(order) {
  if (typeof order.totalItems === "number") return order.totalItems;
  if (Array.isArray(order.items)) {
    return order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }
  return 0;
}

function getThumbnail(order) {
  const firstItem = order.items?.[0];
  return firstItem?.product?.image || firstItem?.image || null;
}

function getTotal(order) {
  const amount = order.totalPrice ?? order.totalAmount;
  return amount !== undefined && amount !== null ? `$${Number(amount).toFixed(2)}` : "—";
}

function StatusPill({ value }) {
  const normalized = (value || "unknown").toLowerCase();
  return <span className={`myorders-pill myorders-pill--${normalized}`}>{value || "Unknown"}</span>;
}

export default function MyOrders() {
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
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
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="myorders-empty">
        <h2 className="myorders-empty__title">Sign in to view your orders</h2>
        <p className="myorders-empty__sub">You'll need an account to see your order history.</p>
        <Link to="/signin" className="myorders-empty__btn">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="myorders-empty">
        <div className="myorders-loading-dots"><span /><span /><span /></div>
        <p className="myorders-empty__sub">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="myorders-empty">
        <h2 className="myorders-empty__title">Something went wrong</h2>
        <p className="myorders-fetch-error">{error}</p>
        <button className="myorders-empty__btn myorders-empty__btn--btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="myorders-empty">
        <div className="myorders-empty__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h2 className="myorders-empty__title">No orders yet</h2>
        <p className="myorders-empty__sub">When you place an order, it'll show up here.</p>
        <Link to="/" className="myorders-empty__btn">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="myorders-root">
      <div className="myorders-header">
        <div className="myorders-header__inner">
          <div>
            <h1 className="myorders-header__title">My Orders</h1>
            <p className="myorders-header__count">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div className="myorders-list">
        {orders.map((order) => (
          <Link to={`/orders/${order._id}`} key={order._id} className="myorders-card">
            <img
              src={getThumbnail(order) || "/placeholder-product.png"}
              alt=""
              className="myorders-card__img"
            />
            <div className="myorders-card__body">
              <div className="myorders-card__top">
                <p className="myorders-card__id">Order #{order._id?.slice(-8)}</p>
                <p className="myorders-card__date">{formatDate(order.createdAt)}</p>
              </div>
              <p className="myorders-card__items">{getItemCount(order)} item(s) · {getTotal(order)}</p>
              <div className="myorders-card__pills">
                <StatusPill value={order.paymentStatus} />
                <StatusPill value={order.orderStatus} />
              </div>
            </div>
            <svg className="myorders-card__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}