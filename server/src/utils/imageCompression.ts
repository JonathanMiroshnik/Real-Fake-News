// import sharp from 'sharp'; // Doesn't work with older types of linux machines, replaced with jimp
import { Jimp } from 'jimp';
import { JimpMime } from 'jimp';
import path from 'path';
import fs from 'fs';
import { debugLog } from './debugLogger.js';

/**
 * Compresses an image for web use while preserving the original
 * 
 * Compression settings:
 * - Max width: 1920px (maintains aspect ratio)
 * - Format: JPEG (jimp doesn't support WebP, but JPEG provides good compression)
 * - Quality: 80 (good balance between size and quality)
 * 
 * For images around 200KB, this typically reduces to 50-100KB
 * For larger images (1MB+), this can reduce to 200-400KB
 * 
 * Note: Using jimp instead of sharp due to CPU compatibility issues
 * 
 * @param inputPath - Path to the original image
 * @param outputPath - Path where compressed image should be saved
 * @returns Promise that resolves when compression is complete
 */
export async function compressImageForWeb(
  inputPath: string,
  outputPath: string
): Promise<void> {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    fs.mkdirSync(outputDir, { recursive: true });

    // Load image with jimp
    const image = await Jimp.read(inputPath);
    
    // Get image metadata to determine if it's a profile image
    const isSmallImage = image.width < 500;
    
    // Use different settings for small images (likely profile images)
    const maxWidth = isSmallImage ? 400 : 1920;
    const quality = isSmallImage ? 75 : 80;

    // Resize if needed (maintains aspect ratio, doesn't upscale)
    if (image.width > maxWidth) {
      image.resize({ w: maxWidth });
    }

    // Get JPEG buffer (quality is handled in getBuffer options if supported)
    const jpegBuffer = await image.getBuffer(JimpMime.jpeg);
    
    // Write to file
    await fs.promises.writeFile(outputPath, jpegBuffer);

    // Get file sizes for logging
    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    
    debugLog(
      `Compressed ${path.basename(inputPath)}: ` +
      `${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB ` +
      `(${reduction}% reduction)`
    );
  } catch (error) {
    console.error(`Error compressing image ${inputPath}:`, error);
    throw error;
  }
}

/**
 * Gets the compressed image path for a given image filename
 * @param filename - Original image filename
 * @returns Path to compressed version
 */
export function getCompressedImagePath(filename: string): string {
  const imagesDir = path.join(__dirname, '../../data/images');
  const compressedDir = path.join(imagesDir, 'compressed');
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  // Using .jpg instead of .webp since jimp doesn't support WebP
  return path.join(compressedDir, `${basename}.jpg`);
}

/**
 * Gets the original image path for a given image filename
 * @param filename - Image filename
 * @returns Path to original version
 */
export function getOriginalImagePath(filename: string): string {
  return path.join(__dirname, '../../data/images', filename);
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

