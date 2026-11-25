import OptimizedImage from ".//OptimizedImage.jsx";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-subscribe">
          <div className="subscribe-text">
            <h3>Subscribe to updates</h3>
            <p>Stay informed about our latest news and offerings.</p>
          </div>
          <form className="subscribe-form" onSubmit={e => e.preventDefault()}>
            <div className="input-wrapper">
              <input type="email" placeholder="Your email here" required />
            </div>
            <button type="submit">Subscribe</button>
          </form>
          <p className="privacy">By subscribing, you agree to our Privacy Policy.</p>
        </div>

        <hr />

        <div className="footer-links">
          <div className="link-column">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact Support</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Blog Posts</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
          <div className="link-column">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Webinars</a></li>
              <li><a href="#">Case Studies</a></li>
              <li><a href="#">Testimonials</a></li>
              <li><a href="#">Events</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="link-column">
            <h4>Support</h4>
            <ul>
              <li><a href="#">User Guide</a></li>
              <li><a href="#">Feedback</a></li>
              <li><a href="#">Partnerships</a></li>
              <li><a href="#">Newsroom</a></li>
              <li><a href="#">Accessibility</a></li>
            </ul>
          </div>
          <div className="link-column">
            <h4>Connect With Us</h4>
            <ul>
              <li><a href="#">Social Media</a></li>
              <li><a href="#">Newsletter</a></li>
              <li><a href="#">Community</a></li>
              <li><a href="#">Support Center</a></li>
              <li><a href="#">Help Desk</a></li>
            </ul>
          </div>
          <div className="link-column">
            <h4>Stay Updated</h4>
            <ul>
              <li><a href="#">Link Twenty One</a></li>
              <li><a href="#">Link Twenty Two</a></li>
              <li><a href="#">Link Twenty Three</a></li>
              <li><a href="#">Link Twenty Four</a></li>
              <li><a href="#">Link Twenty Five</a></li>
            </ul>
          </div>
          <div className="link-column">
            <h4>Stay Connected</h4>
            <ul>
              <li><a href="#">Link Twenty Six</a></li>
              <li><a href="#">Link Twenty Seven</a></li>
              <li><a href="#">Link Twenty Eight</a></li>
              <li><a href="#">Link Twenty Nine</a></li>
              <li><a href="#">Link Thirty</a></li>
            </ul>
          </div>
        </div>
        <hr />

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <OptimizedImage
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e76991aa421e489c54cbc0932fc11287b53692fc?width=304"
              alt="Department Logo"
              className="footer-logo"
             />
          </div>
          <div className="footer-bottom-right">
            <p>© 2026 Christ Team</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
