import { useState, useEffect } from "react";
import { useCart } from "../context/useCart";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../config/api.js";
import { getAddress, createAddress } from "../config/address.js";
import "./Checkout.css";

const STEPS = ["Shipping", "Payment", "Review"];

const REQUIRED_SHIPPING_FIELDS = [
  "firstName", "lastName", "email", "phone",
  "address", "city", "state", "zip", "country",
];

const FIELD_LABELS = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  address: "Street address",
  city: "City",
  state: "State",
  zip: "ZIP code",
  country: "Country",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function StepIndicator({ step }) {
  return (
    <div className="co-steps">
      {STEPS.map((label, i) => (
        <div key={label} className={`co-step ${i < step ? "co-step--done" : i === step ? "co-step--active" : ""}`}>
          <div className="co-step__circle">
            {i < step ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <span>{i + 1}</span>
            )}
          </div>
          <span className="co-step__label">{label}</span>
          {i < STEPS.length - 1 && <div className="co-step__line" />}
        </div>
      ))}
    </div>
  );
}

export default function Checkout() {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [ordered, setOrdered] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "", country: "United States",
  });

  const [shippingErrors, setShippingErrors] = useState({});

  // Saved-address tracking: whether the user already has an address on the
  // backend (POST vs PATCH), whether the loaded one has since been edited
  // (so we know whether a PATCH is actually needed), and load state.
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [addressDirty, setAddressDirty] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressLoadError, setAddressLoadError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAddressLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAddress() {
      setAddressLoading(true);
      setAddressLoadError("");
      try {
        const address = await getAddress();
        if (cancelled) return;

        if (address) {
          setShipping((prev) => ({
            ...prev,
            firstName: address.firstName || "",
            lastName:  address.lastName  || "",
            email:     address.email     || "",
            phone:     address.phone     || "",
            address:   address.address   || "",
            city:      address.city      || "",
            state:     address.state     || "",
            zip:       address.zip       || "",
            country:   address.country   || prev.country,
          }));
          setHasSavedAddress(true);
          setAddressDirty(false);
        } else {
          setHasSavedAddress(false);
        }
      } catch (err) {
        if (!cancelled) {
          setAddressLoadError(
            err.response?.data?.message ||
            err.response?.data?.msg ||
            "Couldn't load your saved address — you can still fill it in below."
          );
        }
      } finally {
        if (!cancelled) setAddressLoading(false);
      }
    }

    fetchAddress();
    return () => {
      cancelled = true;
    };
  }, []);

  const [payment, setPayment] = useState({
    method: "card",
    cardName: "", cardNumber: "", expiry: "", cvv: "",
  });

  const [paymentErrors, setPaymentErrors] = useState({});

  const [shippingMethod, setShippingMethod] = useState("standard");

  const shippingCost = shippingMethod === "express" ? 14.99 : shippingMethod === "overnight" ? 24.99 : (subtotal > 50 ? 0 : 9.99);
  const tax   = subtotal * 0.075;
  const total = subtotal + shippingCost + tax;

  function handleShippingChange(e) {
    const { name, value } = e.target;
    setShipping((p) => ({ ...p, [name]: value }));
    setAddressDirty(true);
    if (shippingErrors[name]) {
      setShippingErrors((p) => ({ ...p, [name]: undefined }));
    }
  }

  function validateShipping() {
    const errors = {};

    REQUIRED_SHIPPING_FIELDS.forEach((field) => {
      if (!shipping[field] || !shipping[field].trim()) {
        errors[field] = `${FIELD_LABELS[field]} is required.`;
      }
    });

    if (!errors.email && !EMAIL_RE.test(shipping.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleContinueToPayment() {
    if (validateShipping()) {
      setStep(1);
    }
  }

  function handlePaymentChange(e) {
    const { name, value } = e.target;
    setPayment((p) => ({ ...p, [name]: value }));
    if (paymentErrors[name]) {
      setPaymentErrors((p) => ({ ...p, [name]: undefined }));
    }
  }

  function formatCard(val) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val) {
    return val.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
  }

  function handlePaymentMethodChange(method) {
    setPayment((p) => ({ ...p, method }));
    setPaymentErrors({});
  }

  function validatePayment() {
    if (payment.method !== "card") {
      setPaymentErrors({});
      return true;
    }

    const errors = {};

    if (!payment.cardName.trim()) {
      errors.cardName = "Name on card is required.";
    }

    const digits = payment.cardNumber.replace(/\s/g, "");
    if (!digits) {
      errors.cardNumber = "Card number is required.";
    } else if (digits.length !== 16) {
      errors.cardNumber = "Enter a valid 16-digit card number.";
    }

    if (!payment.expiry) {
      errors.expiry = "Expiry date is required.";
    } else {
      const match = payment.expiry.match(/^(\d{2})\/(\d{2})$/);
      if (!match || Number(match[1]) < 1 || Number(match[1]) > 12) {
        errors.expiry = "Enter a valid expiry date (MM/YY).";
      }
    }

    if (!payment.cvv) {
      errors.cvv = "CVV is required.";
    } else if (payment.cvv.length < 3) {
      errors.cvv = "Enter a valid CVV.";
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleContinueToReview() {
    if (validatePayment()) {
      setStep(2);
    }
  }

  const [orderError, setOrderError]   = useState("");
  const [orderLoading, setOrderLoading] = useState(false);

  // Ensures the address is saved on the backend before payment starts.
  // Always saves via POST (see note below on why PATCH is avoided here).
  // Returns true if the address is confirmed saved, false if it failed
  // (in which case handlePlaceOrder should stop and show the error).
  async function ensureAddressSaved() {
    const addressPayload = {
      firstName: shipping.firstName,
      lastName:  shipping.lastName,
      email:     shipping.email,
      phone:     shipping.phone,
      country:   shipping.country,
      state:     shipping.state,
      city:      shipping.city,
      address:   shipping.address,
      zip:       shipping.zip,
    };

    // Already saved and nothing's changed since — no need to call again.
    if (hasSavedAddress && !addressDirty) {
      return true;
    }

    try {
      // Using POST here regardless of whether an address already exists —
      // PATCH isn't behaving reliably on the backend yet, so we save via
      // POST until there's a dedicated "update address" flow that calls
      // PATCH explicitly.
      await createAddress(addressPayload);
      setHasSavedAddress(true);
      setAddressDirty(false);
      return true;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Failed to save your delivery address. Please check the details and try again.";
      setOrderError(message);
      return false;
    }
  }

  async function handlePlaceOrder() {
    setOrderError("");
    setOrderLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setOrderError("You must be signed in to place an order. Please sign in and try again.");
      setOrderLoading(false);
      return;
    }

    const addressSaved = await ensureAddressSaved();
    if (!addressSaved) {
      setOrderLoading(false);
      return;
    }

    try {
      const response = await api.post(
        "/payment/initialize",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Payment initialize response:", response.data);

      if (response.data?.success && response.data?.authorization_url) {
        // The backend now loads the saved address itself when the order is
        // created — no need to stash it in storage for payment/verify.
        window.location.href = response.data.authorization_url;
      } else {
        const msg =
          response.data?.message ||
          response.data?.msg     ||
          "Payment initialization failed. Please try again.";
        setOrderError(msg);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        err.response?.data?.msg     ||
        err.message                 ||
        "Failed to initialize payment. Please try again.";
      console.error("Payment initialize error:", err.response?.data || err.message);
      setOrderError(message);
    } finally {
      setOrderLoading(false);
    }
  }

  if (items.length === 0 && !ordered) {
    return (
      <div className="co-empty">
        <p>Your cart is empty.</p>
        <Link to="/" className="co-empty__btn">Shop Now</Link>
      </div>
    );
  }

  if (ordered) {
    return (
      <div className="co-success">
        <div className="co-success__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6DDC8A" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 className="co-success__title">Order Placed!</h2>
        <p className="co-success__sub">Thank you for your order. You'll receive a confirmation email shortly.</p>
        <p className="co-success__order">Order #BC-{Math.floor(Math.random() * 900000 + 100000)}</p>
        <Link to="/" className="co-success__btn">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="co-root">
      <div className="co-header">
        <div className="co-header__inner">
          <Link to="/cart" className="co-header__back">← Back to Cart</Link>
          <h1 className="co-header__title">Checkout</h1>
        </div>
      </div>

      <div className="co-body">
        <div className="co-main">
          <StepIndicator step={step} />

          {step === 0 && (
            <div className="co-section">
              <h2 className="co-section__title">Shipping Information</h2>

              {addressLoading && (
                <p className="co-section__sub" style={{ marginTop: 0, textTransform: "none", fontSize: "13px" }}>
                  Loading your saved address...
                </p>
              )}
              {addressLoadError && (
                <div className="co-order-error" style={{ marginTop: 0, marginBottom: "1rem" }}>
                  {addressLoadError}
                </div>
              )}

              <div className="co-form">
                <div className="co-field-row">
                  <div className="co-field">
                    <label className="co-field__label">First Name</label>
                    <input
                      className={`co-field__input ${shippingErrors.firstName ? "co-field__input--error" : ""}`}
                      name="firstName"
                      placeholder="Ibrahim"
                      value={shipping.firstName}
                      onChange={handleShippingChange}
                      required
                    />
                    {shippingErrors.firstName && <span className="co-field__error">{shippingErrors.firstName}</span>}
                  </div>
                  <div className="co-field">
                    <label className="co-field__label">Last Name</label>
                    <input
                      className={`co-field__input ${shippingErrors.lastName ? "co-field__input--error" : ""}`}
                      name="lastName"
                      placeholder="Abiodun"
                      value={shipping.lastName}
                      onChange={handleShippingChange}
                      required
                    />
                    {shippingErrors.lastName && <span className="co-field__error">{shippingErrors.lastName}</span>}
                  </div>
                </div>
                <div className="co-field-row">
                  <div className="co-field">
                    <label className="co-field__label">Email</label>
                    <input
                      className={`co-field__input ${shippingErrors.email ? "co-field__input--error" : ""}`}
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={shipping.email}
                      onChange={handleShippingChange}
                      required
                    />
                    {shippingErrors.email && <span className="co-field__error">{shippingErrors.email}</span>}
                  </div>
                  <div className="co-field">
                    <label className="co-field__label">Phone</label>
                    <input
                      className={`co-field__input ${shippingErrors.phone ? "co-field__input--error" : ""}`}
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={shipping.phone}
                      onChange={handleShippingChange}
                      required
                    />
                    {shippingErrors.phone && <span className="co-field__error">{shippingErrors.phone}</span>}
                  </div>
                </div>
                <div className="co-field">
                  <label className="co-field__label">Street Address</label>
                  <input
                    className={`co-field__input ${shippingErrors.address ? "co-field__input--error" : ""}`}
                    name="address"
                    placeholder="123 Main Street, Apt 4B"
                    value={shipping.address}
                    onChange={handleShippingChange}
                    required
                  />
                  {shippingErrors.address && <span className="co-field__error">{shippingErrors.address}</span>}
                </div>
                <div className="co-field-row co-field-row--3">
                  <div className="co-field">
                    <label className="co-field__label">City</label>
                    <input
                      className={`co-field__input ${shippingErrors.city ? "co-field__input--error" : ""}`}
                      name="city"
                      placeholder="New York"
                      value={shipping.city}
                      onChange={handleShippingChange}
                      required
                    />
                    {shippingErrors.city && <span className="co-field__error">{shippingErrors.city}</span>}
                  </div>
                  <div className="co-field">
                    <label className="co-field__label">State</label>
                    <input
                      className={`co-field__input ${shippingErrors.state ? "co-field__input--error" : ""}`}
                      name="state"
                      placeholder="NY"
                      value={shipping.state}
                      onChange={handleShippingChange}
                      required
                    />
                    {shippingErrors.state && <span className="co-field__error">{shippingErrors.state}</span>}
                  </div>
                  <div className="co-field">
                    <label className="co-field__label">ZIP Code</label>
                    <input
                      className={`co-field__input ${shippingErrors.zip ? "co-field__input--error" : ""}`}
                      name="zip"
                      placeholder="10001"
                      value={shipping.zip}
                      onChange={handleShippingChange}
                      required
                    />
                    {shippingErrors.zip && <span className="co-field__error">{shippingErrors.zip}</span>}
                  </div>
                </div>
                <div className="co-field">
                  <label className="co-field__label">Country</label>
                  <select
                    className={`co-field__input co-field__select ${shippingErrors.country ? "co-field__input--error" : ""}`}
                    name="country"
                    value={shipping.country}
                    onChange={handleShippingChange}
                    required
                  >
                    {["United States","United Kingdom","Canada","Australia","Nigeria","Germany","France","Japan"].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  {shippingErrors.country && <span className="co-field__error">{shippingErrors.country}</span>}
                </div>

                <h3 className="co-section__sub">Shipping Method</h3>
                <div className="co-shipping-methods">
                  {[
                    { id: "standard", label: "Standard Shipping", eta: "5–7 business days", price: subtotal > 50 ? "Free" : "$9.99" },
                    { id: "express",  label: "Express Shipping",  eta: "2–3 business days", price: "$14.99" },
                    { id: "overnight",label: "Overnight",         eta: "Next business day",  price: "$24.99" },
                  ].map((m) => (
                    <label key={m.id} className={`co-ship-method ${shippingMethod === m.id ? "co-ship-method--active" : ""}`}>
                      <input type="radio" name="shippingMethod" value={m.id} checked={shippingMethod === m.id} onChange={() => setShippingMethod(m.id)} />
                      <div className="co-ship-method__body">
                        <span className="co-ship-method__label">{m.label}</span>
                        <span className="co-ship-method__eta">{m.eta}</span>
                      </div>
                      <span className="co-ship-method__price">{m.price}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="co-nav">
                <span />
                <button className="co-btn co-btn--primary" onClick={handleContinueToPayment}>Continue to Payment →</button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="co-section">
              <h2 className="co-section__title">Payment Details</h2>
              <div className="co-form">
                <div className="co-payment-methods">
                  {[["card","Credit / Debit Card"],["paypal","PayPal"],["apple","Apple Pay"]].map(([id, label]) => (
                    <button
                      key={id}
                      className={`co-payment-tab ${payment.method === id ? "co-payment-tab--active" : ""}`}
                      onClick={() => handlePaymentMethodChange(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {payment.method === "card" && (
                  <>
                    <div className="co-field">
                      <label className="co-field__label">Name on Card</label>
                      <input
                        className={`co-field__input ${paymentErrors.cardName ? "co-field__input--error" : ""}`}
                        name="cardName"
                        placeholder="Ibrahim Abiodun"
                        value={payment.cardName}
                        onChange={handlePaymentChange}
                        required
                      />
                      {paymentErrors.cardName && <span className="co-field__error">{paymentErrors.cardName}</span>}
                    </div>
                    <div className="co-field">
                      <label className="co-field__label">Card Number</label>
                      <input
                        className={`co-field__input co-field__input--mono ${paymentErrors.cardNumber ? "co-field__input--error" : ""}`}
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={payment.cardNumber}
                        onChange={(e) => {
                          setPayment((p) => ({ ...p, cardNumber: formatCard(e.target.value) }));
                          if (paymentErrors.cardNumber) setPaymentErrors((p) => ({ ...p, cardNumber: undefined }));
                        }}
                        maxLength={19}
                        required
                      />
                      {paymentErrors.cardNumber && <span className="co-field__error">{paymentErrors.cardNumber}</span>}
                    </div>
                    <div className="co-field-row">
                      <div className="co-field">
                        <label className="co-field__label">Expiry Date</label>
                        <input
                          className={`co-field__input co-field__input--mono ${paymentErrors.expiry ? "co-field__input--error" : ""}`}
                          name="expiry"
                          placeholder="MM/YY"
                          value={payment.expiry}
                          onChange={(e) => {
                            setPayment((p) => ({ ...p, expiry: formatExpiry(e.target.value) }));
                            if (paymentErrors.expiry) setPaymentErrors((p) => ({ ...p, expiry: undefined }));
                          }}
                          maxLength={5}
                          required
                        />
                        {paymentErrors.expiry && <span className="co-field__error">{paymentErrors.expiry}</span>}
                      </div>
                      <div className="co-field">
                        <label className="co-field__label">CVV</label>
                        <input
                          className={`co-field__input co-field__input--mono ${paymentErrors.cvv ? "co-field__input--error" : ""}`}
                          name="cvv"
                          placeholder="•••"
                          value={payment.cvv}
                          onChange={(e) => {
                            setPayment((p) => ({ ...p, cvv: e.target.value.replace(/\D/g,"").slice(0,4) }));
                            if (paymentErrors.cvv) setPaymentErrors((p) => ({ ...p, cvv: undefined }));
                          }}
                          maxLength={4}
                          required
                        />
                        {paymentErrors.cvv && <span className="co-field__error">{paymentErrors.cvv}</span>}
                      </div>
                    </div>
                  </>
                )}

                {payment.method === "paypal" && (
                  <div className="co-alt-pay">
                    <svg width="80" height="22" viewBox="0 0 80 22" fill="none">
                      <text x="0" y="18" fontFamily="Inter" fontWeight="700" fontSize="18" fill="#003087">Pay</text>
                      <text x="30" y="18" fontFamily="Inter" fontWeight="700" fontSize="18" fill="#009cde">Pal</text>
                    </svg>
                    <p>You'll be redirected to PayPal to complete your payment securely.</p>
                  </div>
                )}

                {payment.method === "apple" && (
                  <div className="co-alt-pay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    <p>Complete your purchase with Apple Pay in one tap.</p>
                  </div>
                )}

                <div className="co-secure-note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>Your payment info is encrypted and never stored.</span>
                </div>
              </div>
              <div className="co-nav">
                <button className="co-btn co-btn--ghost" onClick={() => setStep(0)}>← Back</button>
                <button className="co-btn co-btn--primary" onClick={handleContinueToReview}>Review Order →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="co-section">
              <h2 className="co-section__title">Review Your Order</h2>

              <div className="co-review-block">
                <div className="co-review-block__header">
                  <span>Shipping to</span>
                  <button className="co-review-block__edit" onClick={() => setStep(0)}>Edit</button>
                </div>
                <p className="co-review-block__val">{shipping.firstName} {shipping.lastName}</p>
                <p className="co-review-block__val co-review-block__val--sub">{shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}</p>
                <p className="co-review-block__val co-review-block__val--sub">{shipping.country} · {shipping.phone}</p>
              </div>

              <div className="co-review-block">
                <div className="co-review-block__header">
                  <span>Payment</span>
                  <button className="co-review-block__edit" onClick={() => setStep(1)}>Edit</button>
                </div>
                <p className="co-review-block__val">
                  {payment.method === "card"
                    ? `Card ending ···· ${payment.cardNumber.slice(-4) || "----"}`
                    : payment.method === "paypal" ? "PayPal" : "Apple Pay"}
                </p>
              </div>

              <div className="co-review-items">
                {items.map((item) => (
                  <div key={item.id} className="co-review-item">
                    <img src={item.thumbnail} alt={item.title} className="co-review-item__img" />
                    <div className="co-review-item__info">
                      <p className="co-review-item__title">{item.title}</p>
                      <p className="co-review-item__qty">Qty: {item.qty}</p>
                    </div>
                    <span className="co-review-item__price">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {orderError && (
                <div className="co-order-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {orderError}
                </div>
              )}

              <div className="co-nav">
                <button className="co-btn co-btn--ghost" onClick={() => setStep(1)}>← Back</button>
                <button
                  className="co-btn co-btn--place"
                  onClick={handlePlaceOrder}
                  disabled={orderLoading}
                >
                  {orderLoading ? "Placing Order…" : `Place Order · $${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="co-sidebar">
          <h2 className="co-sidebar__title">Order Summary</h2>
          <div className="co-sidebar__items">
            {items.map((item) => (
              <div key={item.id} className="co-sidebar__item">
                <div className="co-sidebar__item-img-wrap">
                  <img src={item.thumbnail} alt={item.title} />
                  <span className="co-sidebar__item-qty">{item.qty}</span>
                </div>
                <span className="co-sidebar__item-name">{item.title}</span>
                <span className="co-sidebar__item-price">${(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="co-sidebar__rows">
            <div className="co-sidebar__row"><span>Subtotal ({totalItems} items)</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="co-sidebar__row"><span>Shipping</span><span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span></div>
            <div className="co-sidebar__row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
          </div>
          <div className="co-sidebar__total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}