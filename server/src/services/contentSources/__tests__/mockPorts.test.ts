import { describe, it, expect } from 'vitest';
import { MockImageGenerator, MockNewsSource, MockTextGenerator, MockTransitSource } from '../mocks/mockPorts.js';

/**
 * The mock ports are what make a job runnable without an API key, so what matters
 * is that they are *deterministic* and *marked*. A mock that returned random text
 * would make every job test assert nothing, and one that forgot its marker would
 * write rows that look live — the exact failure Phase A's column exists to catch.
 */
describe('mock ports stamp their content as mock', () => {
  it.each([
    ['news', new MockNewsSource()],
    ['text', new MockTextGenerator()],
    ['image', new MockImageGenerator()],
    ['transit', new MockTransitSource()],
  ])('%s port reports contentSource "mock"', (_name, port) => {
    expect(port.contentSource).toBe('mock');
  });
});

describe('MockNewsSource', () => {
  it('marks every item it returns', async () => {
    const { items } = await new MockNewsSource().fetchPage();

    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.contentSource).toBe('mock');
    }
  });

  it('serves the same page twice identically, apart from the relative dates', async () => {
    const source = new MockNewsSource();
    const first = await source.fetchPage();
    const second = await source.fetchPage();

    expect(second.items.map((i) => i.article_id)).toEqual(first.items.map((i) => i.article_id));
  });

  it('advances through pages and terminates with an empty token', async () => {
    const source = new MockNewsSource();
    const first = await source.fetchPage();
    const second = await source.fetchPage(first.nextPage);

    expect(second.items.length).toBeGreaterThan(0);
    expect(second.nextPage).toBe('');
  });

  it('does not repeat items across pages', async () => {
    const source = new MockNewsSource();
    const first = await source.fetchPage();
    const second = await source.fetchPage(first.nextPage);
    const firstIds = first.items.map((item) => item.article_id);
    const secondIds = second.items.map((item) => item.article_id);

    expect(secondIds.filter((id) => firstIds.includes(id))).toEqual([]);
  });

  it('reports a budget that shrinks as it is used', async () => {
    const source = new MockNewsSource();
    const before = source.remainingCalls();
    await source.fetchPage();

    expect(source.remainingCalls()).toBe(before - 1);
  });
});

describe('MockTextGenerator', () => {
  it('produces the same text for the same prompt', async () => {
    const generator = new MockTextGenerator();
    const first = await generator.generate('the same prompt');
    const second = await generator.generate('the same prompt');

    expect(second?.generatedText).toBe(first?.generatedText);
  });

  it('produces different text for different prompts', async () => {
    const generator = new MockTextGenerator();
    const first = await generator.generate('prompt one');
    const second = await generator.generate('prompt two');

    expect(second?.generatedText).not.toBe(first?.generatedText);
  });

  it('returns parseable JSON when json_object is requested', async () => {
    const result = await new MockTextGenerator().generate('a prompt', 'json_object');

    expect(result?.success).toBe(true);
    expect(() => JSON.parse(result?.generatedText ?? '')).not.toThrow();
  });

  it('says it is placeholder text, so it cannot be mistaken for an article', async () => {
    const result = await new MockTextGenerator().generate('a prompt');

    expect(result?.generatedText).toContain('placeholder');
  });
});

describe('MockImageGenerator', () => {
  it('returns a stable filename per prompt, without writing a file', async () => {
    const generator = new MockImageGenerator();
    const name = await generator.generateAndSave('a picture');

    expect(name).toMatch(/\.webp$/);
    expect(name).toContain('mock');
  });
});

describe('MockTransitSource', () => {
  it('returns the same sky for the same date', async () => {
    const source = new MockTransitSource();
    const date = new Date('2026-11-09T00:00:00.000Z');

    const first = await source.fetchTransits(date);
    const second = await source.fetchTransits(date);

    expect(second).toEqual(first);
    expect(first.date).toBe('2026-11-09');
  });

  it('returns a different sky for a different date', async () => {
    const source = new MockTransitSource();
    const tenth = await source.fetchTransits(new Date('2026-11-10T00:00:00.000Z'));
    const eleventh = await source.fetchTransits(new Date('2026-11-11T00:00:00.000Z'));

    expect(eleventh).not.toEqual(tenth);
  });
});
