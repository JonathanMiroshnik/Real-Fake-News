/**
 * Tiled placeholder images — the drawing code shared by the dev seeder and the
 * `npm run image:fake` preview CLI.
 *
 * This is the *only* placeholder generator left. The read-time fake-data
 * fallback that used to wrap it was deleted with `ENABLE_FAKE_DATA`
 * (`plans/dev-content-seeding.md` Phase 2), so there is no longer a flag to
 * consult: the function always draws. Nothing here invents content on a
 * request path — both callers write files deliberately, ahead of serving them.
 *
 * Callers:
 *   `scripts/seed/seedImages.ts` — passes a deterministic filename and a seeded
 *   PRNG, so repeated seed runs are byte-identical.
 *   `scripts/generateFakeImage.ts` — the manual preview CLI.
 */
import path from 'path';
import fs from 'fs';
import { Jimp, rgbaToInt, type JimpInstance } from 'jimp';
import { v4 as uuidv4 } from 'uuid';
import { getImagesDirectory } from './imageCompression.js';

/**
 * Configuration for the tiled placeholder image generation.
 *
 * Can be overridden via environment variables:
 * - FAKE_IMAGE_WIDTH        (default: 896)  Actual image width in pixels
 * - FAKE_IMAGE_HEIGHT       (default: 512)  Actual image height in pixels
 * - FAKE_IMAGE_TILES_X      (default: 8)    Number of tiles horizontally
 * - FAKE_IMAGE_TILES_Y      (default: 6)    Number of tiles vertically
 * - FAKE_IMAGE_COLOR_MIN_R  (default: 30)   Minimum red value (0-255)
 * - FAKE_IMAGE_COLOR_MAX_R  (default: 225)  Maximum red value (0-255)
 * - FAKE_IMAGE_COLOR_MIN_G  (default: 30)   Minimum green value (0-255)
 * - FAKE_IMAGE_COLOR_MAX_G  (default: 225)  Maximum green value (0-255)
 * - FAKE_IMAGE_COLOR_MIN_B  (default: 30)   Minimum blue value (0-255)
 * - FAKE_IMAGE_COLOR_MAX_B  (default: 225)  Maximum blue value (0-255)
 */
export interface PlaceholderImageConfig {
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Number of tiles horizontally */
  tilesX: number;
  /** Number of tiles vertically */
  tilesY: number;
  /** Minimum RGB channel values (inclusive) */
  colorMin: { r: number; g: number; b: number };
  /** Maximum RGB channel values (inclusive) */
  colorMax: { r: number; g: number; b: number };
}

/** How to draw one placeholder image. */
export interface PlaceholderImageOptions {
  /** Overrides for individual config fields; the rest comes from the environment. */
  config?: Partial<PlaceholderImageConfig>;
  /** Exact file name to write (no directories). Defaults to `placeholder-<uuid>.png`. */
  filename?: string;
  /** Random source in [0, 1). Pass a seeded PRNG for reproducible tiles. */
  random?: () => number;
}

/** A filled rectangle in image coordinates. */
interface TileRect {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function readChannel(variableName: string, fallback: string): number {
  return clampChannel(parseInt(process.env[variableName] || fallback, 10));
}

/**
 * Reads PlaceholderImageConfig from environment variables,
 * falling back to defaults for any missing values.
 */
export function getPlaceholderImageConfig(): PlaceholderImageConfig {
  return {
    width: parseInt(process.env.FAKE_IMAGE_WIDTH || '896', 10),
    height: parseInt(process.env.FAKE_IMAGE_HEIGHT || '512', 10),
    tilesX: parseInt(process.env.FAKE_IMAGE_TILES_X || '8', 10),
    tilesY: parseInt(process.env.FAKE_IMAGE_TILES_Y || '6', 10),
    colorMin: {
      r: readChannel('FAKE_IMAGE_COLOR_MIN_R', '30'),
      g: readChannel('FAKE_IMAGE_COLOR_MIN_G', '30'),
      b: readChannel('FAKE_IMAGE_COLOR_MIN_B', '30'),
    },
    colorMax: {
      r: readChannel('FAKE_IMAGE_COLOR_MAX_R', '225'),
      g: readChannel('FAKE_IMAGE_COLOR_MAX_G', '225'),
      b: readChannel('FAKE_IMAGE_COLOR_MAX_B', '225'),
    },
  };
}

/**
 * Resolves the file name to write, refusing anything that could escape IMAGES_PATH.
 */
function resolveImageFilename(filename?: string): string {
  if (filename === undefined) {
    return `placeholder-${uuidv4()}.png`;
  }

  const safeFilename = path.basename(filename);
  const hasExtension = path.extname(safeFilename) !== '';
  const isPathTraversal = safeFilename !== filename;

  if (!hasExtension || isPathTraversal) {
    throw new Error(`Invalid placeholder filename: "${filename}"`);
  }

  return safeFilename;
}

/** Samples one colour channel in [min, max] inclusive from the given random source. */
function pickChannel(random: () => number, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

/** Draws one tile, clipping at the image bounds (remainder pixels stay black). */
function fillTile(
  image: JimpInstance,
  rect: TileRect,
  canvasWidth: number,
  canvasHeight: number,
): void {
  for (let pixelY = 0; pixelY < rect.height; pixelY++) {
    for (let pixelX = 0; pixelX < rect.width; pixelX++) {
      const x = rect.x + pixelX;
      const y = rect.y + pixelY;
      const isInsideCanvas = x < canvasWidth && y < canvasHeight;
      if (isInsideCanvas) {
        image.setPixelColor(rect.color, x, y);
      }
    }
  }
}

/** Fills the whole image with a grid of random colours from the configured range. */
function paintTiles(
  image: JimpInstance,
  config: PlaceholderImageConfig,
  random: () => number,
): void {
  const tileWidth = Math.floor(config.width / config.tilesX);
  const tileHeight = Math.floor(config.height / config.tilesY);

  for (let tileY = 0; tileY < config.tilesY; tileY++) {
    for (let tileX = 0; tileX < config.tilesX; tileX++) {
      const rect: TileRect = {
        x: tileX * tileWidth,
        y: tileY * tileHeight,
        width: tileWidth,
        height: tileHeight,
        color: rgbaToInt(
          pickChannel(random, config.colorMin.r, config.colorMax.r),
          pickChannel(random, config.colorMin.g, config.colorMax.g),
          pickChannel(random, config.colorMin.b, config.colorMax.b),
          255,
        ),
      };

      fillTile(image, rect, config.width, config.height);
    }
  }
}

/**
 * Generates a tiled-colour placeholder image and saves it to IMAGES_PATH.
 *
 * @param options config overrides, an explicit filename and/or a PRNG.
 * @returns The saved filename (e.g. `dev-article-01.png`).
 * @throws If the dimensions are invalid, the filename is unsafe, or writing fails.
 */
export async function createTilePlaceholderImage(
  options: PlaceholderImageOptions = {},
): Promise<string> {
  const config: PlaceholderImageConfig = {
    ...getPlaceholderImageConfig(),
    ...options.config,
  };

  const hasValidDimensions =
    config.tilesX >= 1 && config.tilesY >= 1 && config.width >= 1 && config.height >= 1;
  if (!hasValidDimensions) {
    throw new Error(
      `Invalid placeholder dimensions: ${config.width}x${config.height} ` +
        `in ${config.tilesX}x${config.tilesY} tiles`,
    );
  }

  const filename = resolveImageFilename(options.filename);
  const random = options.random ?? Math.random;

  const image = new Jimp({ width: config.width, height: config.height, color: 0x000000 });
  paintTiles(image, config, random);

  const imagesDirectory = getImagesDirectory();
  fs.mkdirSync(imagesDirectory, { recursive: true });

  const buffer = await image.getBuffer('image/png');
  await fs.promises.writeFile(path.join(imagesDirectory, filename), buffer);

  return filename;
}
