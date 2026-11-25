import OptimizedImage from "../components/OptimizedImage.jsx";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import "./ContactUs.css";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzgdXbWDJa1Rlllx5lNLzct-Pw2YElDJiYdHrqIhdvWTxEVHGvGgNr09ukqNo590-6e/exec";
const CARD_EASE = [0.22, 1, 0.36, 1];

export default function ContactUs() {
  async function handleContactSubmit(e) {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.result === "success") {
        alert("Your message has been submitted. Thank you!");
        e.target.reset();
      } else {
        alert("Oops, something went wrong. Please try again later.");
        console.error("Submission failed:", result);
      }
    } catch (err) {
      alert("Error contacting server. Please try again in a moment.");
      console.error(err);
    }
  }

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = new FormData(e.target).get("newsletterEmail");
    alert("Subscribed successfully with " + email);
    e.target.reset();
  }

  return (
    <div className="contact-page">
      <Navbar />

      <main className="contact-wrapper">
        <OptimizedImage
          src="https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/20755cad4db69315f1c2def14361a58d0f51c72a?placeholderIfAbsent=true"
          alt="Map Background"
          className="contact-bg"
        />
        <motion.section
          className="contact-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: CARD_EASE }}>
          <h1>Contact&nbsp;Us</h1>
          <form id="contactForm" onSubmit={handleContactSubmit}>
            <label className="input-group">
              <input type="text" name="name" placeholder="Name" required />
            </label>
            <label className="input-group">
              <input type="email" name="email" placeholder="E-mail" required />
            </label>
            <label className="input-group">
              <input type="tel" name="phone" placeholder="Phone" required />
            </label>
            <label className="input-group textarea-group">
              <textarea
                name="message"
                rows="4"
                placeholder="Message"
                required></textarea>
            </label>
            <button type="submit" className="btn-primary">
              Send&nbsp;Message
            </button>
          </form>
        </motion.section>
      </main>

      <footer className="site-footer">
        <section className="newsletter-strip">
          <div className="newsletter-copy">
            <h2>Subscribe to updates</h2>
            <p>Stay informed about our latest news and offerings.</p>
          </div>
          <form
            id="newsletterForm"
            className="newsletter-form"
            onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              name="newsletterEmail"
              placeholder="Your email here"
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          <p className="privacy-note">
            By subscribing, you agree to our Privacy&nbsp;Policy.
          </p>
        </section>
        <hr />
        <div className="footer-bottom-row">
          <OptimizedImage
            src="https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/37d3f381ddc80a116ed948088198303064e25c38?placeholderIfAbsent=true"
            alt="Department logo"
          />
          <p>© 2026 Christ Team</p>
        </div>
      </footer>
    </div>
  );
}
