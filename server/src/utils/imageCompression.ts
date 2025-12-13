import { Jimp } from 'jimp';
import { JimpMime } from 'jimp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { debugLog } from './debugLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lazy-load Sharp for WebP support
let sharp: any = null;
let sharpLoaded = false;

/**
 * Lazy-loads Sharp if available for WebP support
 * @returns Sharp instance or null if not available
 */
async function getSharp(): Promise<any> {
  if (sharpLoaded) {
    return sharp;
  }
  
  sharpLoaded = true;
  try {
    const sharpModule = await import('sharp');
    sharp = sharpModule.default;
    debugLog('✅ Sharp loaded - WebP compression enabled');
    return sharp;
  } catch (error) {
    debugLog('⚠️ Sharp not available - WebP images will be converted to JPEG');
    return null;
  }
}

/**
 * Gets the images directory path based on the database directory
 * Images are stored in the same directory as the SQLite database
 * 
 * Priority:
 * 1. IMAGES_DATA_PATH (from root .env) - if set, use directly
 * 2. SQLITE_DATA_PATH (from root .env) - if set, use SQLITE_DATA_PATH/images
 * 3. DATABASE_PATH (container path) - if set, use dirname(DATABASE_PATH)/images
 * 4. Default: server/data/images (relative to server root)
 * 
 * @returns Path to the images directory
 */
export function getImagesDirectory(): string {
  // Priority 1: Use IMAGES_DATA_PATH if explicitly set
  if (process.env.IMAGES_DATA_PATH) {
    return process.env.IMAGES_DATA_PATH;
  }
  
  // Priority 2: Use SQLITE_DATA_PATH/images if SQLITE_DATA_PATH is set
  if (process.env.SQLITE_DATA_PATH) {
    return path.join(process.env.SQLITE_DATA_PATH, 'images');
  }
  
  // Priority 3: Use DATABASE_PATH to determine directory (for Docker containers)
  if (process.env.DATABASE_PATH) {
    const dbDir = path.dirname(process.env.DATABASE_PATH);
    return path.join(dbDir, 'images');
  }
  
  // Priority 4: Default fallback - relative to server root
  const serverRoot = path.resolve(__dirname, '../..');
  return path.join(serverRoot, 'data/images');
}

/**
 * Compresses an image for web use while preserving the original
 * 
 * Compression settings:
 * - Max width: 1920px (maintains aspect ratio)
 * - Format: WebP (if input is WebP and sharp is available), otherwise JPEG
 * - Quality: 80 (good balance between size and quality)
 * 
 * For images around 200KB, this typically reduces to 50-100KB
 * For larger images (1MB+), this can reduce to 200-400KB
 * 
 * Uses Sharp for WebP files (preserves WebP format), Jimp for other formats
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

    const inputExt = path.extname(inputPath).toLowerCase();
    const isWebP = inputExt === '.webp';
    const isSmallImage = await getImageWidth(inputPath) < 500;
    
    // Use different settings for small images (likely profile images)
    const maxWidth = isSmallImage ? 400 : 1920;
    const quality = isSmallImage ? 75 : 80;

    // Use Sharp for WebP files if available
    const sharpInstance = await getSharp();
    if (isWebP && sharpInstance) {
      const image = sharpInstance(inputPath);
      const metadata = await image.metadata();
      
      let pipeline = image;
      
      // Resize if needed (maintains aspect ratio, doesn't upscale)
      if (metadata.width && metadata.width > maxWidth) {
        pipeline = pipeline.resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside'
        });
      }
      
      // Compress as WebP
      const webpBuffer = await pipeline.webp({ quality }).toBuffer();
      await fs.promises.writeFile(outputPath, webpBuffer);
      
      const originalSize = fs.statSync(inputPath).size;
      const compressedSize = webpBuffer.length;
      const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
      
      debugLog(
        `Compressed ${path.basename(inputPath)} (WebP): ` +
        `${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB ` +
        `(${reduction}% reduction)`
      );
      return;
    }

    // Fallback to Jimp for non-WebP or if Sharp is not available
    // If WebP but Sharp not available, convert to JPEG
    const image = await Jimp.read(inputPath);
    
    // Resize if needed (maintains aspect ratio, doesn't upscale)
    if (image.width > maxWidth) {
      image.resize({ w: maxWidth });
    }

    // Get JPEG buffer (fallback format)
    const jpegBuffer = await image.getBuffer(JimpMime.jpeg);
    
    // Write to file
    await fs.promises.writeFile(outputPath, jpegBuffer);

    // Get file sizes for logging
    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    
    const formatNote = isWebP ? ' (WebP→JPEG, Sharp not available)' : '';
    debugLog(
      `Compressed ${path.basename(inputPath)}${formatNote}: ` +
      `${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB ` +
      `(${reduction}% reduction)`
    );
  } catch (error) {
    console.error(`Error compressing image ${inputPath}:`, error);
    throw error;
  }
}

/**
 * Gets the width of an image without loading the full image
 * @param imagePath - Path to the image file
 * @returns Image width in pixels
 */
async function getImageWidth(imagePath: string): Promise<number> {
  try {
    // Try Sharp first (faster, doesn't load full image)
    const sharpInstance = await getSharp();
    if (sharpInstance) {
      const metadata = await sharpInstance(imagePath).metadata();
      if (metadata.width) {
        return metadata.width;
      }
    }
    
    // Fallback to Jimp
    const image = await Jimp.read(imagePath);
    return image.width;
  } catch (error) {
    // If we can't determine, assume it's a regular image (not small)
    return 1000;
  }
}

/**
 * Gets the compressed image path for a given image filename
 * @param filename - Original image filename
 * @returns Path to compressed version (preserves WebP extension if input is WebP)
 */
export function getCompressedImagePath(filename: string): string {
  const imagesDir = getImagesDirectory();
  const compressedDir = path.join(imagesDir, 'compressed');
  const ext = path.extname(filename).toLowerCase();
  const basename = path.basename(filename, ext);
  
  // Preserve WebP extension if input is WebP
  // Note: Actual format depends on Sharp availability at compression time
  // This function just determines the filename - the compression function handles format
  const outputExt = ext === '.webp' ? '.webp' : '.jpg';
  
  return path.join(compressedDir, `${basename}${outputExt}`);
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

