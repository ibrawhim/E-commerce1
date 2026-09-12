import { Link } from "react-router-dom";
import "./About.css";

const PRINCIPLES = [
  {
    number: "01",
    title: "Curated with intent",
    text: "Useful finds, everyday essentials, and considered upgrades brought together in one dependable place.",
  },
  {
    number: "02",
    title: "Choice without noise",
    text: "Clear categories and practical details help you compare what matters and choose with confidence.",
  },
  {
    number: "03",
    title: "Made for real life",
    text: "From the first browse to the front door, every part of the experience is designed to feel simple.",
  },
];

const STEPS = [
  "Explore a broad mix of products in one calm, easy-to-navigate catalog.",
  "Compare the details that make a difference, from price and availability to seller information.",
  "Build a basket that fits your life, then let Bcommerce take care of the next step.",
];

export default function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero__inner">
          <div className="about-hero__copy">
            <p className="about-kicker"><span /> The Bcommerce point of view</p>
            <h1>Good finds.<br /><em>Less searching.</em></h1>
            <p className="about-hero__intro">
              Bcommerce brings the things you need, the pieces you want, and the discoveries in between into one thoughtful marketplace.
            </p>
            <Link to="/" className="about-button">Explore the collection <span aria-hidden="true">&#8594;</span></Link>
          </div>
          <div className="about-hero__art" aria-hidden="true">
            <div className="about-hero__ring about-hero__ring--outer" />
            <div className="about-hero__ring about-hero__ring--inner" />
            <div className="about-hero__mark">B</div>
            <span className="about-hero__label">A marketplace<br />with a point of view</span>
          </div>
        </div>
      </section>

      <section className="about-principles" aria-labelledby="principles-title">
        <div className="about-section-heading">
          <p className="about-kicker"><span /> What guides us</p>
          <h2 id="principles-title">Shopping should feel<br /><em>like a good decision.</em></h2>
        </div>
        <div className="about-principles__grid">
          {PRINCIPLES.map((principle) => (
            <article className="about-principle" key={principle.number}>
              <span className="about-principle__number">{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-process" aria-labelledby="process-title">
        <div className="about-process__visual" aria-hidden="true">
          <span className="about-process__word">B</span>
          <span className="about-process__caption">Browse / choose / enjoy</span>
        </div>
        <div className="about-process__copy">
          <p className="about-kicker"><span /> The experience</p>
          <h2 id="process-title">A better way to<br /><em>find your next thing.</em></h2>
          <p>
            We believe online shopping can be expansive without becoming overwhelming. Bcommerce keeps the discovery wide and the journey straightforward, so you can spend more time finding what fits.
          </p>
          <ol className="about-process__steps">
            {STEPS.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="about-cta">
        <p className="about-kicker"><span /> Start somewhere good</p>
        <h2>There is plenty<br /><em>to discover.</em></h2>
        <Link to="/" className="about-button about-button--light">Browse all products <span aria-hidden="true">&#8594;</span></Link>
      </section>
    </main>
  );
}
