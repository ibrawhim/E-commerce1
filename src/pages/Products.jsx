import { useState, useEffect } from "react";
import axios from "axios";
import "./Products.css";
import CategoryHero from "./CategoryHero";
import ProductDetail from "./ProductDetail";
import { getTheme } from "./categoryThemes";
import { useCart } from "../context/CartContext";

function StarRating({ rating }) {
  return (
    <div className="product-card__stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`product-card__star ${i <= Math.round(rating) ? "filled" : ""}`}>
          ★
        </span>
      ))}
      <span className="product-card__rating-num">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProductCard({ product, theme, onClick }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const originalPrice = (product.price / (1 - product.discountPercentage / 100)).toFixed(2);
  const hasDiscount = product.discountPercentage > 0;
  const savings = (originalPrice - product.price).toFixed(2);

  function handleAdd(e) {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div
      className="product-card"
      style={{ "--card-bg": theme.cardBg, "--card-border": theme.borderColor, "--card-accent": theme.accent, "--card-text": theme.text, "--card-sub": theme.subText }}
      onClick={() => onClick(product.id)}
    >
      <div className="product-card__img-wrapper">
        <img className="product-card__img" src={product.thumbnail} alt={product.title} loading="lazy" />
        {hasDiscount && <div className="product-card__disc-badge">−{Math.round(product.discountPercentage)}%</div>}
        <div className="product-card__stock-badge">{product.availabilityStatus || "In Stock"}</div>
      </div>
      <div className="product-card__body">
        <div className="product-card__brand">{product.brand || product.category}</div>
        <div className="product-card__title">{product.title}</div>
        <StarRating rating={product.rating} />
        <div className="product-card__price-row">
          <span className="product-card__price-now">${product.price.toFixed(2)}</span>
          {hasDiscount && (
            <>
              <span className="product-card__price-was">${originalPrice}</span>
              <span className="product-card__disc-tag">Save ${savings}</span>
            </>
          )}
        </div>
        <div className="product-card__footer">
          <div>
            <div className="product-card__category">{product.category}</div>
            {product.minimumOrderQuantity > 1 && <div className="product-card__moq">MOQ: {product.minimumOrderQuantity}</div>}
          </div>
          <button
            className={`product-card__add-btn ${added ? "product-card__add-btn--added" : ""}`}
            aria-label={`Add ${product.title} to cart`}
            onClick={handleAdd}
          >
            {added ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategorySidebar({ categories, activeCategory, onSelect, theme }) {
  return (
    <aside className="catalog-sidebar" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
      <p className="catalog-sidebar__label" style={{ color: theme.subText }}>Categories</p>
      <ul className="catalog-sidebar__list">
        {["all", ...categories].map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <li key={cat}>
              <button
                className={`catalog-sidebar__item ${isActive ? "active" : ""}`}
                style={{
                  color: isActive ? theme.accent : theme.subText,
                  borderColor: isActive ? theme.accent : "transparent",
                  background: isActive ? `rgba(${theme.accentRgb},0.10)` : "transparent",
                  transition: "all 0.22s ease",
                }}
                onClick={() => onSelect(cat)}
              >
                <span className="catalog-sidebar__bar" style={{ background: isActive ? theme.accent : "transparent" }} />
                {cat === "all" ? "All Products" : cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ")}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortValue, setSortValue] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const theme = getTheme(activeCategory);

  useEffect(() => {
    axios
      .get("https://dummyjson.com/products?limit=100")
      .then((res) => {
        const data = res.data.products;
        setProducts(data);
        setFiltered(data);
        const cats = [...new Set(data.map((p) => p.category))].sort();
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let list = activeCategory === "all" ? [...products] : products.filter((p) => p.category === activeCategory);
    if (sortValue === "price-asc")  list.sort((a, b) => a.price - b.price);
    if (sortValue === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sortValue === "rating")     list.sort((a, b) => b.rating - a.rating);
    if (sortValue === "discount")   list.sort((a, b) => b.discountPercentage - a.discountPercentage);
    setFiltered(list);
  }, [activeCategory, sortValue, products]);

  if (selectedProductId) {
    return (
      <ProductDetail
        productId={selectedProductId}
        onBack={() => setSelectedProductId(null)}
        onProductSelect={(id) => setSelectedProductId(id)}
        initialBg={theme.bg}
      />
    );
  }

  return (
    <div className="catalog-root" style={{ background: theme.bg, transition: "background 0.55s ease" }}>
      {loading && (
        <div className="catalog-loading">
          <span>Loading catalog</span>
          <div className="catalog-loading__dots">
            <span className="catalog-loading__dot" />
            <span className="catalog-loading__dot" />
            <span className="catalog-loading__dot" />
          </div>
        </div>
      )}

      {error && <div className="catalog-error">Failed to load products. Please try again.</div>}

      {!loading && !error && (
        <div className="catalog-top-row">
          <CategoryHero theme={theme} category={activeCategory} />
          <CategorySidebar categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} theme={theme} />
        </div>
      )}

      {!loading && !error && (
        <div className="catalog-toolbar" style={{ background: theme.cardBg, borderTop: `0.5px solid ${theme.borderColor}`, borderBottom: `0.5px solid ${theme.borderColor}` }}>
          <span className="catalog-toolbar__count" style={{ color: theme.subText }}>
            Showing <span style={{ color: theme.accent, fontFamily: "'DM Mono', monospace" }}>{filtered.length}</span> products
          </span>
          <div className="catalog-toolbar__right">
            <span className="catalog-sort-label" style={{ color: theme.subText }}>Sort by</span>
            <select
              className="catalog-sort-select"
              value={sortValue}
              onChange={(e) => setSortValue(e.target.value)}
              style={{ background: theme.bg, borderColor: theme.borderColor, color: theme.subText }}
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Best Discount</option>
            </select>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="catalog-grid" style={{ background: theme.borderColor }}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} theme={theme} onClick={setSelectedProductId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;