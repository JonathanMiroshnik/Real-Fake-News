import './Footer.css'

/**
 * Cross-site global footer component
 */
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
      <div className="legal-links">
          <a href="/disclaimer">Disclaimer</a>
          <a href="/terms">Terms of Use</a>
          <a href="/contact">Contact</a>
        </div>
        <p className="footer-undertext">© 2025 Real Fake News - Satirical AI-generated content.</p>
        <p className="footer-undertext">All rights reserved. Real Fake News is not responsible for the content of external sites.</p>
      </div>
      <a href='https://github.com/JonathanMiroshnik/Real-Fake-News'>Check out the project on GitHub!</a>
    </footer>
  );
};

export default Footer;