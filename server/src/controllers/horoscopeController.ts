import { Request, Response } from 'express';
import { 
  getHoroscopesForDate, 
  getHoroscopeForSign, 
  ensureHoroscopesForToday 
} from '../services/horoscopeService.js';
import { HoroscopeResponse } from '../types/horoscope.js';
import { fetchAstrologicalData } from '../services/astrologyService.js';

/**
 * GET /api/horoscopes
 * Gets all horoscopes for today (or specified date)
 */
export const getHoroscopes = async (req: Request, res: Response): Promise<void> => {
  console.log('getHoroscopes');

  try {
    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : undefined;

    // Ensure horoscopes exist for today if no date specified
    if (!date) {
      const horoscopes = await ensureHoroscopesForToday();
      const response: HoroscopeResponse = {
        success: true,
        horoscopes
      };
      res.json(response);
      return;
    }

    const horoscopes = await getHoroscopesForDate(date);
    const response: HoroscopeResponse = {
      success: true,
      horoscopes
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching horoscopes:', error);
    const response: HoroscopeResponse = {
      success: false,
      error: 'Failed to fetch horoscopes'
    };
    res.status(500).json(response);
  }
};

/**
 * GET /api/horoscopes/:sign
 * Gets horoscope for a specific zodiac sign
 */
export const getHoroscopeBySign = async (req: Request, res: Response): Promise<void> => {
  try {
    const sign = req.params.sign;
    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : undefined;

    // Ensure horoscopes exist for today if no date specified
    if (!date) {
      await ensureHoroscopesForToday();
    }

    const horoscope = await getHoroscopeForSign(sign, date);
    
    if (!horoscope) {
      const response: HoroscopeResponse = {
        success: false,
        error: `Horoscope not found for ${sign}`
      };
      res.status(404).json(response);
      return;
    }

    const response: HoroscopeResponse = {
      success: true,
      horoscope
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching horoscope:', error);
    const response: HoroscopeResponse = {
      success: false,
      error: 'Failed to fetch horoscope'
    };
    res.status(500).json(response);
  }
};

/**
 * GET /api/horoscopes/astrological-data
 * Gets raw astrological data (planetary positions, retrogrades)
 */
export const getAstrologicalData = async (req: Request, res: Response): Promise<void> => {
  try {
    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : undefined;

    const astrologicalData = await fetchAstrologicalData(date);
    res.json({
      success: true,
      data: astrologicalData
    });
    return;
  } catch (error) {
    console.error('Error fetching astrological data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch astrological data'
    });
    return;
  }
};

