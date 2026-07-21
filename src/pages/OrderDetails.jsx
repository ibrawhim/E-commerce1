import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getOrderById, cancelOrder } from "../config/orders";
import "./OrderDetails.css";

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function money(amount) {
  if (amount === undefined || amount === null) return "—";
  return `$${Number(amount).toFixed(2)}`;
}

// Orders can only be cancelled if they haven't shipped/delivered/already
// been cancelled. Adjust this to match your backend's real business rule —
// the backend should still be the source of truth on the cancel endpoint;
// this only controls whether the button is shown.
const NON_CANCELLABLE = ["cancelled", "shipped", "delivered"];

function isCancellable(order) {
  if (!order) return false;
  return !NON_CANCELLABLE.includes((order.orderStatus || "").toLowerCase());
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const { isLoggedIn } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function fetchOrder() {
      setLoading(true);
      setError("");
      try {
        const data = await getOrderById(orderId);
        if (!cancelled) setOrder(data.order || data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            err.response?.data?.msg ||
            err.message ||
            "Failed to load this order."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId, isLoggedIn]);

  async function handleCancel() {
    setCancelling(true);
    setCancelError("");
    try {
      await cancelOrder(orderId);
      // Reflect the cancellation immediately without refetching.
      setOrder((prev) => (prev ? { ...prev, orderStatus: "cancelled" } : prev));
    } catch (err) {
      setCancelError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        err.message ||
        "Failed to cancel this order."
      );
    } finally {
      setCancelling(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="ordd-state">
        <h2 className="ordd-state__title">Sign in to view this order</h2>
        <Link to="/signin" className="ordd-state__btn">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ordd-state">
        <div className="ordd-loading-dots"><span /><span /><span /></div>
        <p className="ordd-state__sub">Loading order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ordd-state">
        <h2 className="ordd-state__title">Something went wrong</h2>
        <p className="ordd-error">{error}</p>
        <Link to="/orders" className="ordd-state__btn">Back to My Orders</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="ordd-state">
        <h2 className="ordd-state__title">Order not found</h2>
        <Link to="/orders" className="ordd-state__btn">Back to My Orders</Link>
      </div>
    );
  }

  const items = order.items || [];
  const address = order.shippingAddress || {};
  const addressName = [address.firstName, address.lastName].filter(Boolean).join(" ") || address.fullName;

  return (
    <div className="ordd-root">
      <div className="ordd-header">
        <div className="ordd-header__inner">
          <Link to="/orders" className="ordd-back">← Back to My Orders</Link>
          <h1 className="ordd-header__title">Order #{order._id?.slice(-8)}</h1>
          <p className="ordd-header__date">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="ordd-body">
        <div className="ordd-main">
          <section className="ordd-section">
            <h2 className="ordd-section__title">Items</h2>
            <div className="ordd-items">
              {items.map((item, idx) => (
                <div className="ordd-item" key={item._id || idx}>
                  <img
                    src={item.product?.image || item.image || "/placeholder-product.png"}
                    alt=""
                    className="ordd-item__img"
                  />
                  <div className="ordd-item__info">
                    <p className="ordd-item__name">{item.product?.name || item.name}</p>
                    <p className="ordd-item__qty">Qty: {item.quantity}</p>
                  </div>
                  <span className="ordd-item__price">{money(item.price)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="ordd-section">
            <h2 className="ordd-section__title">Shipping Address</h2>
            <p className="ordd-address__line">{addressName}</p>
            <p className="ordd-address__line">{address.address}</p>
            <p className="ordd-address__line">
              {[address.city, address.state, address.country].filter(Boolean).join(", ")}
            </p>
            {address.phone && <p className="ordd-address__line">Phone: {address.phone}</p>}
          </section>

          {isCancellable(order) && (
            <section className="ordd-section">
              <button onClick={handleCancel} disabled={cancelling} className="ordd-cancel-btn">
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
              {cancelError && <p className="ordd-error">{cancelError}</p>}
            </section>
          )}
        </div>

        <div className="ordd-sidebar">
          <h2 className="ordd-sidebar__title">Order Summary</h2>
          <div className="ordd-sidebar__rows">
            <div className="ordd-sidebar__row">
              <span>Total</span>
              <span className="ordd-sidebar__val">{money(order.totalAmount ?? order.totalPrice)}</span>
            </div>
            <div className="ordd-sidebar__row">
              <span>Payment Status</span>
              <span className={`ordd-pill ordd-pill--${(order.paymentStatus || "unknown").toLowerCase()}`}>
                {order.paymentStatus || "Unknown"}
              </span>
            </div>
            <div className="ordd-sidebar__row">
              <span>Order Status</span>
              <span className={`ordd-pill ordd-pill--${(order.orderStatus || "unknown").toLowerCase()}`}>
                {order.orderStatus || "Unknown"}
              </span>
            </div>
            {order.paymentReference && (
              <div className="ordd-sidebar__row">
                <span>Payment Ref</span>
                <span className="ordd-sidebar__ref">{order.paymentReference}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}