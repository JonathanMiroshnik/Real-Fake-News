import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createTilePlaceholderImage, type PlaceholderImageConfig } from '../placeholderImage.js';
import { createSeededRandom } from '../../services/contentSources/mocks/mockContent.js';

/**
 * The seeder leans on two properties of this function, so both are tested:
 * it writes a real file into IMAGES_PATH (not a URL, not a data URI), and the
 * same PRNG seed produces the same bytes — that is what makes a repeated
 * `npm run seed:dev` a byte-identical no-op instead of a churn of diff noise.
 *
 * A tiny config keeps the tests fast; the drawing code is resolution-independent.
 */

const TINY_CONFIG: Partial<PlaceholderImageConfig> = {
  width: 64,
  height: 32,
  tilesX: 4,
  tilesY: 2,
};

const originalImagesPath = process.env.IMAGES_PATH;
let testImagesDirectory = '';

beforeAll(() => {
  testImagesDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'placeholder-images-'));
  process.env.IMAGES_PATH = testImagesDirectory;
});

afterAll(() => {
  if (originalImagesPath === undefined) {
    delete process.env.IMAGES_PATH;
  } else {
    process.env.IMAGES_PATH = originalImagesPath;
  }
  fs.rmSync(testImagesDirectory, { recursive: true, force: true });
});

describe('createTilePlaceholderImage', () => {
  it('writes the requested filename into IMAGES_PATH and returns it', async () => {
    const filename = await createTilePlaceholderImage({
      config: TINY_CONFIG,
      filename: 'dev-x.png',
    });

    expect(filename).toBe('dev-x.png');
    expect(fs.existsSync(path.join(testImagesDirectory, 'dev-x.png'))).toBe(true);
  });

  it('produces byte-identical files for the same seed', async () => {
    await createTilePlaceholderImage({
      config: TINY_CONFIG,
      filename: 'seed-a.png',
      random: createSeededRandom(7),
    });
    await createTilePlaceholderImage({
      config: TINY_CONFIG,
      filename: 'seed-b.png',
      random: createSeededRandom(7),
    });

    const first = fs.readFileSync(path.join(testImagesDirectory, 'seed-a.png'));
    const second = fs.readFileSync(path.join(testImagesDirectory, 'seed-b.png'));

    expect(first.equals(second)).toBe(true);
  });

  it('produces different files for different seeds', async () => {
    await createTilePlaceholderImage({
      config: TINY_CONFIG,
      filename: 'seed-c.png',
      random: createSeededRandom(7),
    });
    await createTilePlaceholderImage({
      config: TINY_CONFIG,
      filename: 'seed-d.png',
      random: createSeededRandom(8),
    });

    const first = fs.readFileSync(path.join(testImagesDirectory, 'seed-c.png'));
    const second = fs.readFileSync(path.join(testImagesDirectory, 'seed-d.png'));

    expect(first.equals(second)).toBe(false);
  });

  it('falls back to a uuid filename when none is given', async () => {
    const filename = await createTilePlaceholderImage({ config: TINY_CONFIG });

    expect(filename).toMatch(/^placeholder-[0-9a-f-]{36}\.png$/);
  });

  it('refuses filenames that try to escape IMAGES_PATH', async () => {
    await expect(
      createTilePlaceholderImage({ config: TINY_CONFIG, filename: '../evil.png' }),
    ).rejects.toThrow(/Invalid placeholder filename/);
  });

  it('refuses a filename without an extension', async () => {
    await expect(
      createTilePlaceholderImage({ config: TINY_CONFIG, filename: 'no-extension' }),
    ).rejects.toThrow(/Invalid placeholder filename/);
  });

  it('refuses degenerate dimensions', async () => {
    await expect(
      createTilePlaceholderImage({ config: { ...TINY_CONFIG, width: 0 } }),
    ).rejects.toThrow(/Invalid placeholder dimensions/);
    await expect(
      createTilePlaceholderImage({ config: { ...TINY_CONFIG, tilesX: 0 } }),
    ).rejects.toThrow(/Invalid placeholder dimensions/);
  });
});
