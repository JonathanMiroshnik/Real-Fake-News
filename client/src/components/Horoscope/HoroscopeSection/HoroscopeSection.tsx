import { useEffect, useState } from 'react';
import { Horoscope } from '../../../types/horoscope';
import { getHoroscopes, getAstrologicalData } from '../../../services/horoscopeService';
import HoroscopeCard from '../HoroscopeCard/HoroscopeCard';
import SectionHeader from '../../SectionHeader/SectionHeader';

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
        <div className="py-4">
          <p>Loading horoscopes...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SectionHeader topLine="Daily Horoscopes" bottomLine="Cosmic Guidance" />
        <div className="py-4">
          <p>{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SectionHeader topLine="Daily Horoscopes" bottomLine="Cosmic Guidance" />
      {retrogradeInfo.length > 0 && (
        <div className="bg-[var(--notice-background,#fff3cd)] 
                        border border-[var(--notice-border,#ffc107)] rounded 
                        px-4 py-3 my-4 text-[var(--notice-text,#856404)] text-[0.9rem]">
          <strong>Planets in Retrograde:</strong> {retrogradeInfo.join(', ')}
        </div>
      )}
      <div className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {horoscopes.map((horoscope) => (
            <HoroscopeCard key={horoscope.zodiacSign} horoscope={horoscope} />
          ))}
        </div>
      </div>
    </>
  );
}

export default HoroscopeSection;

