import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./FAQ.css";

const FAQ_CATEGORIES = [
  {
    id: "shopping",
    label: "Shopping",
    questions: [
      {
        question: "How do I find a product?",
        answer: "Browse the catalog from the home page, use the category filters, or search by product name. Select a product to see its details, price, stock, and seller information.",
      },
      {
        question: "Can I save products for later?",
        answer: "Your cart keeps selected products together while you shop. Add an item to the cart, then return to it whenever you are ready to review your order.",
      },
      {
        question: "How can I check product availability?",
        answer: "Availability is shown on each product card and on the product details page. Items marked out of stock cannot be added to your cart.",
      },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    questions: [
      {
        question: "How do I place an order?",
        answer: "Add the products you want to your cart, review the quantities and totals, then select Checkout. Follow the steps to add delivery details and choose a payment method.",
      },
      {
        question: "Where can I view my orders?",
        answer: "Open the account menu and select My Orders. You can review your order history and open an individual order for its full details.",
      },
      {
        question: "Can I change or cancel an order?",
        answer: "Order changes depend on its current status. Check the order details page for the latest information, and contact support as soon as possible if you need help.",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    questions: [
      {
        question: "What payment methods are available?",
        answer: "Payment options are shown during checkout. The available methods may vary based on the current checkout configuration and your order.",
      },
      {
        question: "When is my payment processed?",
        answer: "Payment is submitted after you review your order and confirm checkout. Keep the payment result page open until the transaction status is displayed.",
      },
      {
        question: "What should I do if payment fails?",
        answer: "Check your payment details and try again. If the issue continues, return to your order or contact support with the payment result information.",
      },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    questions: [
      {
        question: "How much does delivery cost?",
        answer: "Delivery charges are calculated in your cart based on the order subtotal. The current shipping cost is shown before you begin checkout.",
      },
      {
        question: "How long will delivery take?",
        answer: "Estimated delivery information is shown with the product or shipping option when available. Timing can vary by seller, destination, and stock status.",
      },
      {
        question: "How do I track my order?",
        answer: "Open My Orders from the account menu and select the order you want to review. Its details page contains the latest order information available.",
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    questions: [
      {
        question: "Do I need an account to shop?",
        answer: "An account is required for cart and checkout actions. Sign up to keep your orders and profile details together in one place.",
      },
      {
        question: "How do I update my profile?",
        answer: "Open the account menu and select Profile. From there you can review and update the profile information supported by your account.",
      },
      {
        question: "How do I sign out?",
        answer: "Select your name in the navigation bar, then choose Sign Out. On smaller screens, open the menu and use the Sign Out action there.",
      },
    ],
  },
];

export default function FAQ() {
  const [query, setQuery] = useState("");
  const [openQuestion, setOpenQuestion] = useState("shopping-0");

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return FAQ_CATEGORIES;

    return FAQ_CATEGORIES.map((category) => ({
      ...category,
      questions: category.questions.filter(({ question, answer }) =>
        `${question} ${answer}`.toLowerCase().includes(normalizedQuery),
      ),
    })).filter((category) => category.questions.length > 0);
  }, [query]);

  function handleSearch(event) {
    setQuery(event.target.value);
    setOpenQuestion(null);
  }

  return (
    <main className="faq-page">
      <section className="faq-hero">
        <div className="faq-hero__inner">
          <div>
            <p className="faq-kicker"><span /> Help, made clear</p>
            <h1>Questions,<br /><em>answered.</em></h1>
            <p className="faq-hero__intro">
              Find straightforward answers about shopping, orders, payments, delivery, and your account.
            </p>
          </div>
          <div className="faq-hero__index" aria-hidden="true">
            <span className="faq-hero__index-number">05</span>
            <span className="faq-hero__index-label">Topics to help<br />you shop with ease</span>
          </div>
        </div>
      </section>

      <section className="faq-content" aria-labelledby="faq-content-title">
        <div className="faq-content__aside">
          <p className="faq-kicker"><span /> Browse by topic</p>
          <h2 id="faq-content-title">Start with<br /><em>what you need.</em></h2>
          <nav className="faq-topic-nav" aria-label="FAQ topics">
            {FAQ_CATEGORIES.map((category) => (
              <a key={category.id} href={`#${category.id}`}>{category.label}<span aria-hidden="true">+</span></a>
            ))}
          </nav>
        </div>

        <div className="faq-content__main">
          <label className="faq-search">
            <span className="faq-search__icon" aria-hidden="true">/</span>
            <span className="faq-search__label">Search questions</span>
            <input value={query} onChange={handleSearch} type="search" placeholder="Try &quot;delivery&quot; or &quot;payment&quot;" />
          </label>

          {filteredCategories.length > 0 ? (
            <div className="faq-groups">
              {filteredCategories.map((category) => (
                <section className="faq-group" id={category.id} key={category.id} aria-labelledby={`${category.id}-title`}>
                  <div className="faq-group__heading">
                    <span className="faq-group__number">{String(FAQ_CATEGORIES.findIndex(({ id }) => id === category.id) + 1).padStart(2, "0")}</span>
                    <h2 id={`${category.id}-title`}>{category.label}</h2>
                  </div>
                  <div className="faq-list">
                    {category.questions.map((item) => {
                      const questionIndex = FAQ_CATEGORIES.find(({ id }) => id === category.id).questions.indexOf(item);
                      const questionId = `${category.id}-${questionIndex}`;
                      const isOpen = openQuestion === questionId;

                      return (
                        <div className={`faq-item ${isOpen ? "faq-item--open" : ""}`} key={item.question}>
                          <button
                            type="button"
                            className="faq-item__question"
                            onClick={() => setOpenQuestion(isOpen ? null : questionId)}
                            aria-expanded={isOpen}
                            aria-controls={`${questionId}-answer`}
                          >
                            <span>{item.question}</span>
                            <span className="faq-item__toggle" aria-hidden="true">{isOpen ? "-" : "+"}</span>
                          </button>
                          <div id={`${questionId}-answer`} className="faq-item__answer" hidden={!isOpen}>
                            <p>{item.answer}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="faq-no-results">
              <h2>No matching questions.</h2>
              <p>Try a broader search, such as shopping, order, or account.</p>
            </div>
          )}
        </div>
      </section>

      <section className="faq-cta">
        <p className="faq-kicker"><span /> Still need a hand?</p>
        <h2>We are here to<br /><em>help you find your way.</em></h2>
        <Link to="/contact" className="faq-cta__link">Contact support <span aria-hidden="true">&#8594;</span></Link>
      </section>
    </main>
  );
}
