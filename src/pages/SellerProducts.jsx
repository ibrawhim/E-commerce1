import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSellerProducts, deleteSellerProduct } from "../config/sellerProducts.js";
import "./SellerProducts.css";

function money(amount) {
  if (amount === undefined || amount === null) return "—";
  return `₦${Number(amount).toLocaleString()}`;
}

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const res = await getSellerProducts();
        if (cancelled) return;
        const list = res?.data || res?.products || (Array.isArray(res) ? res : []);
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            err.response?.data?.msg ||
            "Failed to load your products."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(productId) {
    if (!window.confirm("Delete this product? This can't be undone.")) return;

    setDeleteError("");
    setDeletingId(productId);
    try {
      await deleteSellerProduct(productId);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Failed to delete this product. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="spl-state">
        <div className="spl-loading-dots"><span /><span /><span /></div>
        <p className="spl-state__sub">Loading your products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="spl-state">
        <h2 className="spl-state__title">Something went wrong</h2>
        <p className="spl-error">{error}</p>
        <Link to="/profile" className="spl-state__btn">Back to Profile</Link>
      </div>
    );
  }

  return (
    <div className="spl-root">
      <div className="spl-header">
        <div className="spl-header__inner">
          <div>
            <h1 className="spl-header__title">My Products</h1>
            <p className="spl-header__count">{products.length} listed</p>
          </div>
          <Link to="/seller/products/new" className="spl-new-btn">+ List New Product</Link>
        </div>
      </div>

      <div className="spl-body">
        {deleteError && <p className="spl-error spl-error--floating">{deleteError}</p>}

        {products.length === 0 ? (
          <div className="spl-empty">
            <h2 className="spl-empty__title">You haven't listed any products yet</h2>
            <p className="spl-empty__sub">Get started by listing your first product.</p>
            <Link to="/seller/products/new" className="spl-empty__btn">List a Product</Link>
          </div>
        ) : (
          <div className="spl-list">
            {products.map((product) => {
              const id = product._id || product.id;
              return (
                <div key={id} className="spl-card">
                  <img
                    src={product.images?.[0] || product.image || "/placeholder-product.png"}
                    alt=""
                    className="spl-card__img"
                  />
                  <div className="spl-card__body">
                    <p className="spl-card__title">{product.title}</p>
                    <p className="spl-card__meta">
                      {money(product.price)} · Stock: {product.stock ?? "—"}
                    </p>
                    {product.category && (
                      <span className="spl-card__category">{product.category}</span>
                    )}
                  </div>
                  <div className="spl-card__actions">
                    <Link to={`/seller/products/${id}/edit`} className="spl-edit-btn">
                      Edit
                    </Link>
                    <button
                      className="spl-delete-btn"
                      onClick={() => handleDelete(id)}
                      disabled={deletingId === id}
                    >
                      {deletingId === id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}