import { Horoscope } from '../../../types/horoscope';
import './HoroscopeCard.css';

interface HoroscopeCardProps {
  horoscope: Horoscope;
}

function HoroscopeCard({ horoscope }: HoroscopeCardProps) {
  return (
    <div className="horoscope-card">
      <div className="horoscope-card-header">
        <h3 className="horoscope-card-sign">{horoscope.zodiacSign}</h3>
      </div>
      <div className="horoscope-card-content">
        <p>{horoscope.content}</p>
      </div>
    </div>
  );
}

export default HoroscopeCard;

