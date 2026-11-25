import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../utils/debugLogger.js', () => ({
  debugLog: vi.fn(),
}));

import {
  getSlopMeterReading,
  getWriterModelName,
  DEFAULT_DEEPSEEK_MODEL,
  MODEL_INTELLIGENCE,
  UNKNOWN_MODEL_INTELLIGENCE,
} from '../slopMeterService.js';

describe('slopMeterService', () => {
  let originalModel: string | undefined;

  beforeEach(() => {
    originalModel = process.env.DEEPSEEK_MODEL;
    delete process.env.DEEPSEEK_MODEL;
  });

  afterEach(() => {
    if (originalModel === undefined) {
      delete process.env.DEEPSEEK_MODEL;
    } else {
      process.env.DEEPSEEK_MODEL = originalModel;
    }
  });

  describe('getWriterModelName', () => {
    it('falls back to the default model when DEEPSEEK_MODEL is unset', () => {
      expect(getWriterModelName()).toBe(DEFAULT_DEEPSEEK_MODEL);
    });

    it('treats a blank DEEPSEEK_MODEL as unset', () => {
      process.env.DEEPSEEK_MODEL = '   ';
      expect(getWriterModelName()).toBe(DEFAULT_DEEPSEEK_MODEL);
    });

    it('returns the configured model, trimmed', () => {
      process.env.DEEPSEEK_MODEL = '  deepseek-chat ';
      expect(getWriterModelName()).toBe('deepseek-chat');
    });
  });

  describe('getSlopMeterReading', () => {
    it('reports the known model with its score', () => {
      process.env.DEEPSEEK_MODEL = 'deepseek-chat';
      expect(getSlopMeterReading()).toEqual({
        model: 'deepseek-chat',
        intelligence: MODEL_INTELLIGENCE['deepseek-chat'],
      });
    });

    it('scores an unknown model below the fallback score but keeps its name', () => {
      process.env.DEEPSEEK_MODEL = 'some-future-model';
      const reading = getSlopMeterReading();

      expect(reading.model).toBe('some-future-model');
      expect(reading.intelligence).toBe(UNKNOWN_MODEL_INTELLIGENCE);
    });

    it('always returns an integer between 0 and 100', () => {
      const configuredModels = [...Object.keys(MODEL_INTELLIGENCE), 'unknown-model'];

      for (const model of configuredModels) {
        process.env.DEEPSEEK_MODEL = model;
        const { intelligence } = getSlopMeterReading();

        expect(Number.isInteger(intelligence)).toBe(true);
        expect(intelligence).toBeGreaterThanOrEqual(0);
        expect(intelligence).toBeLessThanOrEqual(100);
      }
    });
  });
});
