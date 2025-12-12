import cron from 'node-cron';
import { generateHoroscopesForDate, saveHoroscopes } from '../services/horoscopeService.js';

/**
 * Generates horoscopes for today
 * This function is called by the scheduler to ensure horoscopes are generated daily
 */
export async function generateDailyHoroscopes(): Promise<void> {
  try {
    console.log('🔮 Starting daily horoscope generation...');
    const today = new Date();
    const horoscopes = await generateHoroscopesForDate(today);
    
    if (horoscopes.length > 0) {
      const saved = await saveHoroscopes(horoscopes);
      if (saved) {
        console.log(`✅ Successfully generated and saved ${horoscopes.length} horoscopes for ${today.toISOString().split('T')[0]}`);
      } else {
        console.error('❌ Failed to save horoscopes to database');
      }
    } else {
      console.warn('⚠️ No horoscopes were generated');
    }
  } catch (error) {
    console.error('❌ Error generating daily horoscopes:', error);
  }
}

/**
 * Schedules daily horoscope generation at midnight
 * This is called by the scheduler initialization
 */
export function scheduleHoroscopeGeneration(): void {
  // Run at midnight every day (00:00)
  cron.schedule('0 0 * * *', async () => {
    await generateDailyHoroscopes();
  });
  
  console.log('📅 Scheduled daily horoscope generation at midnight');
  
  // Also generate horoscopes immediately if they don't exist for today
  generateDailyHoroscopes();
}

