import './DisclaimerPage.css';

export default function DisclaimerPage() {
  return (
    <div className="disclaimer-container">
      <h1>Official Disclaimer (Not Really)</h1>
      <div className="legal-text">
        <p>All content on this website is 100% fabricated, 40% recycled, 
        and 10% inspired by actual events (the boring ones).</p>
        
        <p>By reading our articles, you agree to:</p>
        <ul>
          <li>Laugh at least once per paragraph</li>
          <li>Not fact-check us with actual news sources</li>
          <li>Blame your friends if they believe anything here</li>
        </ul>
        
        <p className="warning">
          ⚠️ May cause side effects including uncontrollable giggles, 
          raised eyebrows, and sudden urges to share with colleagues.
        </p>
      </div>
    </div>
  );
}
