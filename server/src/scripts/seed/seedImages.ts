/**
 * Placeholder images for seeded rows.
 *
 * Filenames are derived from the row key (`dev-article-01.png`), not from a UUID:
 * that is what keeps re-seeding from piling up orphan files, and it lets
 * `--reset` delete exactly the images the seeder wrote.
 *
 * Both the original and the compressed copy are produced, because the client
 * asks for `compressed/<name>.jpg` first and falls back to the original — a seed
 * that only wrote originals would work, but every image request would then miss
 * the cache path on first load.
 */
import fs from 'fs';
import {
  compressImageForWeb,
  getCompressedImagePath,
  getOriginalImagePath,
} from '../../utils/imageCompression.js';
import { createTilePlaceholderImage } from '../../utils/placeholderImage.js';

/**
 * Seeded images are smaller than the fake-data default (896x512): they exist to
 * make the layout real, not to be looked at.
 */
const SEED_IMAGE_CONFIG = {
  width: 640,
  height: 360,
  tilesX: 8,
  tilesY: 5,
} as const;

/**
 * Ensures `<key>.png` exists in IMAGES_PATH, drawing and compressing it if needed.
 *
 * @param baseName file name without extension, normally the row key.
 * @param random seeded PRNG values so the same seed draws the same colours.
 * @returns true if a file was created, false if it was already there.
 */
export async function ensureSeedImage(baseName: string, random: () => number): Promise<boolean> {
  const filename = `${baseName}.png`;
  const originalPath = getOriginalImagePath(filename);

  const needsOriginal = !fs.existsSync(originalPath);
  if (needsOriginal) {
    await createTilePlaceholderImage({ filename, config: SEED_IMAGE_CONFIG, random });
  }

  const compressedPath = getCompressedImagePath(filename);
  const needsCompressed = !fs.existsSync(compressedPath);
  if (needsCompressed) {
    await compressImageForWeb(originalPath, compressedPath);
  }

  return needsOriginal || needsCompressed;
}

/**
 * Deletes the original and compressed copy of a seeded image.
 *
 * @param baseName file name without extension (the row key).
 * @returns number of files actually removed.
 */
export function deleteSeedImage(baseName: string): number {
  const filename = `${baseName}.png`;
  const imagePaths = [getOriginalImagePath(filename), getCompressedImagePath(filename)];

  return imagePaths.reduce((removedCount, imagePath) => {
    const exists = fs.existsSync(imagePath);
    if (exists) {
      fs.rmSync(imagePath, { force: true });
    }
    return exists ? removedCount + 1 : removedCount;
  }, 0);
}
