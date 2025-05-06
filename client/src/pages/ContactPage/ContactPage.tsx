import './ContactPage.css';

export default function ContactPage() {
  return (
    <div className="contact-container">
      <h1>How to (Not) Reach Us</h1>
      <div className="contact-methods">
        <div className="method carrier-pigeon">
          <h2>Carrier Pigeon</h2>
          <p>Attach message to leg of nearest suspicious-looking bird</p>
          <small>Response time: 2-6 business weeks</small>
        </div>

        <div className="method tin-can-phone">
          <h2>Tin Can Phone</h2>
          <p>String length must exceed 500 meters for proper encryption</p>
          <small>Voicemail unavailable since 1947</small>
        </div>

        <div className="method psychic">
          <h2>Psychic Link</h2>
          <p>Think very hard about your message while eating tacos</p>
          <small>We'll know. We're always watching.🌮</small>
        </div>
      </div>
    </div>
  );
}
