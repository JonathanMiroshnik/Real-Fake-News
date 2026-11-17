import { Jimp } from 'jimp';
import { JimpMime } from 'jimp';
import path from 'path';
import fs from 'fs';
import { resolveImagesDirectory } from '../config/paths.js';
import { debugLog } from './debugLogger.js';

/**
 * Gets the images directory path.
 *
 * IMAGES_PATH is required — there is no "next to the database" fallback, so a
 * missing value fails loudly in `config/paths.ts` instead of writing images into
 * an invented directory. The path comes from the same resolver the database
 * uses, keeping the two in sync everywhere (Docker, host, scripts).
 *
 * @returns Absolute path to the images directory
 */
export function getImagesDirectory(): string {
  return resolveImagesDirectory();
}

/**
 * Compresses an image for web use while preserving the original
 *
 * Compression settings:
 * - Max width: 1920px (maintains aspect ratio)
 * - Format: JPEG (Jimp). WebP input is decoded, then re-encoded as JPEG — see
 *   `getCompressedImagePath()`, which names the file after what is written.
 * - Quality: 80 (good balance between size and quality)
 *
 * For images around 200KB, this typically reduces to 50-100KB
 * For larger images (1MB+), this can reduce to 200-400KB
 *
 * Jimp is the only encoder. Sharp was dropped in `bdec878a`: it is a native
 * module that cannot build in this environment (contracts/environment.md #1),
 * and `jimp` already covers every format the pipeline produces.
 *
 * @param inputPath - Path to the original image
 * @param outputPath - Path where compressed image should be saved
 * @returns Promise that resolves when compression is complete
 */
export async function compressImageForWeb(inputPath: string, outputPath: string): Promise<void> {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    fs.mkdirSync(outputDir, { recursive: true });

    const inputExt = path.extname(inputPath).toLowerCase();
    const isWebP = inputExt === '.webp';
    const isSmallImage = (await getImageWidth(inputPath)) < 500;

    // Use different settings for small images (likely profile images)
    const maxWidth = isSmallImage ? 400 : 1920;
    const quality = isSmallImage ? 75 : 80;

    const image = await Jimp.read(inputPath);

    // Resize if needed (maintains aspect ratio, doesn't upscale)
    if (image.width > maxWidth) {
      image.resize({ w: maxWidth });
    }

    // Get JPEG buffer (the only format this pipeline writes)
    const jpegBuffer = await image.getBuffer(JimpMime.jpeg, { quality });

    // Write to file
    await fs.promises.writeFile(outputPath, jpegBuffer);

    const formatNote = isWebP ? ' (WebP→JPEG)' : '';
    logCompressionResult(inputPath, jpegBuffer.length, formatNote);
  } catch (error) {
    console.error(`Error compressing image ${inputPath}:`, error);
    throw error;
  }
}

/**
 * Logs the size before and after a compression run.
 *
 * @param inputPath - Path to the original image
 * @param compressedSize - Size of the bytes that were written
 * @param formatNote - Which encoder produced the output, for the log line
 */
function logCompressionResult(inputPath: string, compressedSize: number, formatNote: string): void {
  const originalSize = fs.statSync(inputPath).size;
  const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

  debugLog(
    `Compressed ${path.basename(inputPath)}${formatNote}: ` +
      `${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB ` +
      `(${reduction}% reduction)`,
  );
}

/**
 * Gets the width of an image, for choosing the compression preset.
 * @param imagePath - Path to the image file
 * @returns Image width in pixels
 */
async function getImageWidth(imagePath: string): Promise<number> {
  try {
    const image = await Jimp.read(imagePath);
    return image.width;
  } catch {
    // If we can't determine, assume it's a regular image (not small)
    return 1000;
  }
}

/**
 * Gets the compressed image path for a given image filename.
 *
 * Always `.jpg`: the compressor writes JPEG bytes for every input format, so a
 * WebP source must not produce a `.webp` name — that file would claim an image
 * type its contents do not match, and browsers would refuse to render it.
 *
 * @param filename - Original image filename
 * @returns Path to compressed version
 */
export function getCompressedImagePath(filename: string): string {
  const imagesDir = getImagesDirectory();
  const compressedDir = path.join(imagesDir, 'compressed');
  const ext = path.extname(filename).toLowerCase();
  const basename = path.basename(filename, ext);

  return path.join(compressedDir, `${basename}.jpg`);
}

/**
 * Gets the original image path for a given image filename
 * @param filename - Image filename
 * @returns Path to original version
 */
export function getOriginalImagePath(filename: string): string {
  const imagesDir = getImagesDirectory();
  return path.join(imagesDir, filename);
}

/**
 * Checks if a compressed version of an image exists
 * @param filename - Image filename
 * @returns True if compressed version exists
 */
export function compressedImageExists(filename: string): boolean {
  const compressedPath = getCompressedImagePath(filename);
  return fs.existsSync(compressedPath);
}

/**
 * Set to track images currently being compressed to prevent duplicate work
 */
const compressingImages = new Set<string>();

/**
 * Compression timeout in milliseconds (30 seconds)
 * Prevents compression from getting stuck indefinitely
 */
const COMPRESSION_TIMEOUT_MS = 30000;

/**
 * Compresses an image in the background with timeout protection
 * This function is fire-and-forget - it doesn't block and handles errors internally
 *
 * @param filename - Image filename to compress
 * @param originalPath - Full path to the original image file
 */
export function compressImageInBackground(filename: string, originalPath: string): void {
  // Check if already compressing this image
  if (compressingImages.has(filename)) {
    debugLog(`Skipping compression of ${filename} - already in progress`);
    return;
  }

  // Check if compressed version already exists
  const compressedPath = getCompressedImagePath(filename);
  if (fs.existsSync(compressedPath)) {
    debugLog(`Skipping compression of ${filename} - compressed version already exists`);
    return;
  }

  // Check if original file exists
  if (!fs.existsSync(originalPath)) {
    console.error(`Cannot compress ${filename} - original file does not exist`);
    return;
  }

  // Mark as compressing
  compressingImages.add(filename);

  // Create a promise with timeout
  const compressionPromise = compressImageForWeb(originalPath, compressedPath)
    .then(() => {
      debugLog(`✅ Background compression completed: ${filename}`);
    })
    .catch((error) => {
      console.error(`❌ Background compression failed for ${filename}:`, error);
    })
    .finally(() => {
      // Always remove from set, even on timeout
      compressingImages.delete(filename);
    });

  // Create timeout promise
  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(() => {
      if (compressingImages.has(filename)) {
        console.error(`⏱️ Compression timeout for ${filename} after ${COMPRESSION_TIMEOUT_MS}ms`);
        compressingImages.delete(filename);
        resolve();
      }
    }, COMPRESSION_TIMEOUT_MS);
  });

  // Race between compression and timeout
  Promise.race([compressionPromise, timeoutPromise]).catch((error) => {
    console.error(`Unexpected error in background compression for ${filename}:`, error);
    compressingImages.delete(filename);
  });
}
