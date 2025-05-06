import './TermsPage.css';

export default function TermsPage() {
  return (
    <div className="terms-container">
      <h1>Terms of (Ab)use</h1>
      <div className="terms-content">
        <section>
          <h2>Article 1: Acceptance of Nonsense</h2>
          <p>By accessing this site, you surrender your right to:</p>
          <ul>
            <li>Take anything seriously</li>
            <li>Complain about factual inaccuracies</li>
            <li>Use our content in academic papers</li>
          </ul>
        </section>
        
        <section className="clauses">
          <h2>Mandatory Provisions</h2>
          <ol>
            <li>Share at least one article weekly</li>
            <li>Pretend to believe 20% of content</li>
            <li>Blink normally while reading (winking optional)</li>
          </ol>
        </section>
        
        <div className="footnote">
          *These terms are binding in 13 imaginary jurisdictions
        </div>
      </div>
    </div>
  );
}
