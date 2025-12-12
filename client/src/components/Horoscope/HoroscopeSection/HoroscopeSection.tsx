import { useEffect, useState } from 'react';
import { Horoscope } from '../../../types/horoscope';
import { getHoroscopes, getAstrologicalData } from '../../../services/horoscopeService';
import HoroscopeCard from '../HoroscopeCard/HoroscopeCard';
import SectionHeader from '../../SectionHeader/SectionHeader';
import './HoroscopeSection.css';

function HoroscopeSection() {
  const [horoscopes, setHoroscopes] = useState<Horoscope[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrogradeInfo, setRetrogradeInfo] = useState<string[]>([]);

  useEffect(() => {
    async function fetchHoroscopes() {
      try {
        setLoading(true);
        const [horoscopeData, astroData] = await Promise.all([
          getHoroscopes(),
          getAstrologicalData()
        ]);

        if (horoscopeData.length > 0) {
          setHoroscopes(horoscopeData);
        } else {
          setError('No horoscopes available');
        }

        if (astroData && astroData.retrogrades.length > 0) {
          setRetrogradeInfo(astroData.retrogrades);
        }
      } catch (err) {
        setError('Failed to load horoscopes');
        console.error('Error fetching horoscopes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHoroscopes();
  }, []);

  if (loading) {
    return (
      <>
        <SectionHeader topLine="Daily Horoscopes" bottomLine="Cosmic Guidance" />
        <div className="horoscope-section-content">
          <p>Loading horoscopes...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SectionHeader topLine="Daily Horoscopes" bottomLine="Cosmic Guidance" />
        <div className="horoscope-section-content">
          <p>{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SectionHeader topLine="Daily Horoscopes" bottomLine="Cosmic Guidance" />
      {retrogradeInfo.length > 0 && (
        <div className="horoscope-retrograde-notice">
          <strong>Planets in Retrograde:</strong> {retrogradeInfo.join(', ')}
        </div>
      )}
      <div className="horoscope-section-content">
        <div className="horoscope-grid">
          {horoscopes.map((horoscope) => (
            <HoroscopeCard key={horoscope.zodiacSign} horoscope={horoscope} />
          ))}
        </div>
      </div>
    </>
  );
}

export default HoroscopeSection;

