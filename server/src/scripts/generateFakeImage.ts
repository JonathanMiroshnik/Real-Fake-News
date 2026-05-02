/**
 * CLI script to generate a single tiled placeholder image.
 *
 * Usage:
 *   npx tsx src/scripts/generateFakeImage.ts [options]
 *
 * Options:
 *   --width <px>       Image width in pixels           (default: 896)
 *   --height <px>      Image height in pixels          (default: 512)
 *   --tiles-x <num>    Number of tiles horizontally    (default: 8)
 *   --tiles-y <num>    Number of tiles vertically      (default: 6)
 *   --color-min-r      Min red value 0-255             (default: 30)
 *   --color-max-r      Max red value 0-255             (default: 225)
 *   --color-min-g      Min green value 0-255           (default: 30)
 *   --color-max-g      Max green value 0-255           (default: 225)
 *   --color-min-b      Min blue value 0-255            (default: 30)
 *   --color-max-b      Max blue value 0-255            (default: 225)
 *   --output <path>    Output path (overrides images dir)
 *   --help, -h         Show this help message
 *
 * Examples:
 *   npx tsx src/scripts/generateFakeImage.ts
 *   npx tsx src/scripts/generateFakeImage.ts --width 1920 --height 1080 --tiles-x 12 --tiles-y 8
 *   npx tsx src/scripts/generateFakeImage.ts --color-min-r 200 --color-max-r 255 --color-min-g 0 --color-max-g 100
 *   npx tsx src/scripts/generateFakeImage.ts --output ./my-image.png
 */

import { PlaceholderImageConfig, generatePlaceholderImage } from '../services/fakeDataService.js';
import path from 'path';
import fs from 'fs';

function parseArgs(): { config: Partial<PlaceholderImageConfig>; output?: string; help: boolean } {
  const args = process.argv.slice(2);
  const result: ReturnType<typeof parseArgs> = { config: {}, help: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      result.help = true;
      continue;
    }

    const next = (): number => {
      const val = parseInt(args[++i], 10);
      if (isNaN(val)) {
        console.error('❌ Expected a number after', arg);
        process.exit(1);
      }
      return val;
    };

    switch (arg) {
      case '--width':
        result.config.width = next();
        break;
      case '--height':
        result.config.height = next();
        break;
      case '--tiles-x':
        result.config.tilesX = next();
        break;
      case '--tiles-y':
        result.config.tilesY = next();
        break;
      case '--color-min-r':
        result.config.colorMin = {
          ...(result.config.colorMin || { r: 30, g: 30, b: 30 }),
          r: next(),
        };
        break;
      case '--color-max-r':
        result.config.colorMax = {
          ...(result.config.colorMax || { r: 225, g: 225, b: 225 }),
          r: next(),
        };
        break;
      case '--color-min-g':
        result.config.colorMin = {
          ...(result.config.colorMin || { r: 30, g: 30, b: 30 }),
          g: next(),
        };
        break;
      case '--color-max-g':
        result.config.colorMax = {
          ...(result.config.colorMax || { r: 225, g: 225, b: 225 }),
          g: next(),
        };
        break;
      case '--color-min-b':
        result.config.colorMin = {
          ...(result.config.colorMin || { r: 30, g: 30, b: 30 }),
          b: next(),
        };
        break;
      case '--color-max-b':
        result.config.colorMax = {
          ...(result.config.colorMax || { r: 225, g: 225, b: 225 }),
          b: next(),
        };
        break;
      case '--output':
        result.output = args[++i];
        break;
      default:
        console.error('❌ Unknown option:', arg);
        console.error('   Use --help');
        process.exit(1);
    }
  }
  return result;
}

function printHelp(): void {
  console.log(`
🎨 Fake Image Generator - Real-Fake-News
========================================

Generates a tiled-color placeholder image and saves it to the server's
images directory (or a custom path).

Usage:
  npx tsx src/scripts/generateFakeImage.ts [options]

Options:
  --width <px>       Image width                 (default: 896)
  --height <px>      Image height                (default: 512)
  --tiles-x <num>    Tiles horizontally          (default: 8)
  --tiles-y <num>    Tiles vertically            (default: 6)
  --color-min-r      Min red 0-255               (default: 30)
  --color-max-r      Max red 0-255               (default: 225)
  --color-min-g      Min green 0-255             (default: 30)
  --color-max-g      Max green 0-255             (default: 225)
  --color-min-b      Min blue 0-255              (default: 30)
  --color-max-b      Max blue 0-255              (default: 225)
  --output <path>    Custom output path
  --help, -h         Show this help

Examples:
  npx tsx src/scripts/generateFakeImage.ts
  npx tsx src/scripts/generateFakeImage.ts --width 1920 --height 1080 --tiles-x 12 --tiles-y 8
`);
}

async function main(): Promise<void> {
  const { config, output, help } = parseArgs();
  if (help) {
    printHelp();
    return;
  }

  console.log('🎨 Generating placeholder image...');
  console.log('   Config:', JSON.stringify(config));

  const filename = await generatePlaceholderImage(config);
  if (!filename) {
    console.error('❌ Failed to generate image. Is ENABLE_FAKE_DATA=true in .env?');
    process.exit(1);
  }

  if (output) {
    const { getImagesDirectory } = await import('../utils/imageCompression.js');
    const imagesDir = getImagesDirectory();
    const srcPath = path.join(imagesDir, filename);
    const destPath = path.resolve(output);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log('✅ Saved to:', destPath);
    console.log('   (also in images dir:', filename + ')');
  } else {
    console.log('✅ Image saved:', filename);
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
