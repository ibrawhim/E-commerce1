import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  createSellerProduct,
  getSellerProduct,
  updateSellerProduct,
} from "../config/sellerProducts.js";
import "./SellerProductForm.css";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  brand: "",
  sku: "",
  weight: "",
  width: "",
  height: "",
  depth: "",
  tags: "",
  warrantyInformation: "",
  shippingInformation: "",
  returnPolicy: "",
  minimumOrderQuantity: "1",
};

// Builds the FormData payload matching the backend's expected shape.
// Numbers are sent as strings (FormData only holds strings/files anyway);
// dimensions and tags are JSON-stringified as the API expects.
function buildProductFormData(form, imageFiles) {
  const fd = new FormData();
  fd.append("title", form.title.trim());
  fd.append("description", form.description.trim());
  fd.append("category", form.category.trim());
  fd.append("price", form.price);
  fd.append("stock", form.stock);
  fd.append("brand", form.brand.trim());
  fd.append("sku", form.sku.trim());
  fd.append("weight", form.weight);
  fd.append(
    "dimensions",
    JSON.stringify({
      width: Number(form.width) || 0,
      height: Number(form.height) || 0,
      depth: Number(form.depth) || 0,
    })
  );
  fd.append(
    "tags",
    JSON.stringify(
      form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );
  fd.append("warrantyInformation", form.warrantyInformation.trim());
  fd.append("shippingInformation", form.shippingInformation.trim());
  fd.append("returnPolicy", form.returnPolicy.trim());
  fd.append("minimumOrderQuantity", form.minimumOrderQuantity);
  imageFiles.forEach((file) => fd.append("images", file));
  return fd;
}

export default function SellerProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(productId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [loading, setLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setLoadError("");
      try {
        const res = await getSellerProduct(productId);
        if (cancelled) return;
        const p = res?.data || res?.product || res;

        setForm({
          title: p.title || "",
          description: p.description || "",
          category: p.category || "",
          price: p.price ?? "",
          stock: p.stock ?? "",
          brand: p.brand || "",
          sku: p.sku || "",
          weight: p.weight ?? "",
          width: p.dimensions?.width ?? "",
          height: p.dimensions?.height ?? "",
          depth: p.dimensions?.depth ?? "",
          tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
          warrantyInformation: p.warrantyInformation || "",
          shippingInformation: p.shippingInformation || "",
          returnPolicy: p.returnPolicy || "",
          minimumOrderQuantity: p.minimumOrderQuantity ?? "1",
        });
        setExistingImages(Array.isArray(p.images) ? p.images : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err.response?.data?.message ||
            err.response?.data?.msg ||
            "Failed to load this product."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [productId, isEditMode]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    setImageFiles(Array.from(e.target.files || []));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError("");
    
    if (!isEditMode && imageFiles.length === 0) {
      setSaveError("Please add at least one product image.");
      return;
    }
    
    setSaving(true);
    
    try {
      const formData = buildProductFormData(form, imageFiles);
      if (isEditMode) {
        await updateSellerProduct(productId, formData);
      } else {
        await createSellerProduct(formData);
      }

      navigate("/seller/products");
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        err.message ||
        `Failed to ${isEditMode ? "update" : "create"} product. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="spf-state">
        <div className="spf-loading-dots"><span /><span /><span /></div>
        <p className="spf-state__sub">Loading product...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="spf-state">
        <h2 className="spf-state__title">Something went wrong</h2>
        <p className="spf-error">{loadError}</p>
        <Link to="/seller/products" className="spf-state__btn">Back to My Products</Link>
      </div>
    );
  }

  return (
    <div className="spf-root">
      <div className="spf-header">
        <div className="spf-header__inner">
          <Link to="/seller/products" className="spf-back">← Back to My Products</Link>
          <h1 className="spf-header__title">
            {isEditMode ? "Edit Product" : "List a New Product"}
          </h1>
        </div>
      </div>

      <div className="spf-body">
        <form className="spf-form" onSubmit={handleSubmit}>
          <section className="spf-section">
            <h2 className="spf-section__title">Basic Information</h2>

            <div className="spf-field">
              <label className="spf-field__label">Title</label>
              <input
                className="spf-field__input"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Apple iPhone 15"
                required
              />
            </div>

            <div className="spf-field">
              <label className="spf-field__label">Description</label>
              <textarea
                className="spf-field__input spf-field__input--textarea"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Brand new Apple iPhone 15"
                required
              />
            </div>

            <div className="spf-field-row">
              <div className="spf-field">
                <label className="spf-field__label">Category</label>
                <input
                  className="spf-field__input"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Smartphones"
                  required
                />
              </div>
              <div className="spf-field">
                <label className="spf-field__label">Brand</label>
                <input
                  className="spf-field__input"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Apple"
                />
              </div>
            </div>
          </section>

          <section className="spf-section">
            <h2 className="spf-section__title">Pricing & Stock</h2>

            <div className="spf-field-row">
              <div className="spf-field">
                <label className="spf-field__label">Price (₦)</label>
                <input
                  className="spf-field__input"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="850000"
                  required
                />
              </div>
              <div className="spf-field">
                <label className="spf-field__label">Stock</label>
                <input
                  className="spf-field__input"
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="10"
                  required
                />
              </div>
            </div>

            <div className="spf-field-row">
              <div className="spf-field">
                <label className="spf-field__label">SKU</label>
                <input
                  className="spf-field__input"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="APP-IP15-001"
                />
              </div>
              <div className="spf-field">
                <label className="spf-field__label">Minimum Order Qty</label>
                <input
                  className="spf-field__input"
                  name="minimumOrderQuantity"
                  type="number"
                  min="1"
                  value={form.minimumOrderQuantity}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className="spf-section">
            <h2 className="spf-section__title">Shipping & Dimensions</h2>

            <div className="spf-field">
              <label className="spf-field__label">Weight (g)</label>
              <input
                className="spf-field__input"
                name="weight"
                type="number"
                min="0"
                value={form.weight}
                onChange={handleChange}
                placeholder="171"
              />
            </div>

            <div className="spf-field-row spf-field-row--3">
              <div className="spf-field">
                <label className="spf-field__label">Width (cm)</label>
                <input
                  className="spf-field__input"
                  name="width"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.width}
                  onChange={handleChange}
                  placeholder="7.81"
                />
              </div>
              <div className="spf-field">
                <label className="spf-field__label">Height (cm)</label>
                <input
                  className="spf-field__input"
                  name="height"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.height}
                  onChange={handleChange}
                  placeholder="14.76"
                />
              </div>
              <div className="spf-field">
                <label className="spf-field__label">Depth (cm)</label>
                <input
                  className="spf-field__input"
                  name="depth"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.depth}
                  onChange={handleChange}
                  placeholder="0.78"
                />
              </div>
            </div>

            <div className="spf-field">
              <label className="spf-field__label">Shipping Information</label>
              <input
                className="spf-field__input"
                name="shippingInformation"
                value={form.shippingInformation}
                onChange={handleChange}
                placeholder="Ships within 3-5 days"
              />
            </div>
          </section>

          <section className="spf-section">
            <h2 className="spf-section__title">Policies & Tags</h2>

            <div className="spf-field">
              <label className="spf-field__label">Warranty Information</label>
              <input
                className="spf-field__input"
                name="warrantyInformation"
                value={form.warrantyInformation}
                onChange={handleChange}
                placeholder="1 year warranty"
              />
            </div>

            <div className="spf-field">
              <label className="spf-field__label">Return Policy</label>
              <input
                className="spf-field__input"
                name="returnPolicy"
                value={form.returnPolicy}
                onChange={handleChange}
                placeholder="30 days return policy"
              />
            </div>

            <div className="spf-field">
              <label className="spf-field__label">Tags (comma-separated)</label>
              <input
                className="spf-field__input"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="phone, apple, iphone"
              />
            </div>
          </section>

          <section className="spf-section">
            <h2 className="spf-section__title">Images</h2>

            {isEditMode && existingImages.length > 0 && (
              <div className="spf-existing-images">
                <p className="spf-existing-images__label">Current images</p>
                <div className="spf-existing-images__grid">
                  {existingImages.map((src, idx) => (
                    <img key={idx} src={src} alt="" className="spf-existing-images__img" />
                  ))}
                </div>
                <p className="spf-existing-images__hint">
                  Uploading new images below will replace these.
                </p>
              </div>
            )}

            <div className="spf-field">
              <label className="spf-field__label">
                {isEditMode ? "Replace Images (optional)" : "Product Images"}
              </label>
              <input
                className="spf-field__file"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              {imageFiles.length > 0 && (
                <p className="spf-file-count">{imageFiles.length} file(s) selected</p>
              )}
            </div>
          </section>

          {saveError && <p className="spf-error">{saveError}</p>}

          <div className="spf-actions">
            <Link to="/seller/products" className="spf-cancel-btn">Cancel</Link>
            <button type="submit" className="spf-save-btn" disabled={saving}>
              {saving
                ? (isEditMode ? "Saving..." : "Listing...")
                : (isEditMode ? "Save Changes" : "List Product")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}