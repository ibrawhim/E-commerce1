import { useState } from "react";
import { Link } from "react-router-dom";
import "./Contact.css";

const CONTACT_EMAIL = "support@bcommerce.example";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setSubmitted(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const subject = `Bcommerce support request from ${form.name}`;
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero__inner">
          <div>
            <p className="contact-kicker"><span /> We are listening</p>
            <h1>Let&apos;s talk<br /><em>it through.</em></h1>
            <p className="contact-hero__intro">
              Have a question about an order, a product, or your account? Send us a note and we&apos;ll help you find the next step.
            </p>
          </div>
          <div className="contact-hero__aside">
            <span className="contact-hero__mark">B</span>
            <span className="contact-hero__label">Customer support<br />Mon-Fri / 9-5</span>
          </div>
        </div>
      </section>

      <section className="contact-content" aria-labelledby="contact-form-title">
        <div className="contact-content__copy">
          <p className="contact-kicker"><span /> Get in touch</p>
          <h2 id="contact-form-title">A useful reply<br /><em>starts here.</em></h2>
          <p>
            Tell us what you need and include any order details that might help. Your message will open in your email app, ready for you to send.
          </p>
          <a className="contact-email" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <Link className="contact-back" to="/faq">Browse FAQs <span aria-hidden="true">&#8594;</span></Link>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="contact-field">
            <span>Name</span>
            <input name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
          </label>
          <label className="contact-field">
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" />
          </label>
          <label className="contact-field">
            <span>How can we help?</span>
            <textarea name="message" value={form.message} onChange={handleChange} required rows="6" />
          </label>
          <button className="contact-submit" type="submit">Open email to send <span aria-hidden="true">&#8594;</span></button>
          {submitted && <p className="contact-form__notice" role="status">Your email app should open with the message ready to send.</p>}
        </form>
      </section>
    </main>
  );
}
