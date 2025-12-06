import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Compresses an image for web use while preserving the original
 * 
 * Compression settings:
 * - Max width: 1920px (maintains aspect ratio)
 * - Format: WebP (better compression than PNG/JPEG)
 * - Quality: 80 (good balance between size and quality)
 * 
 * For images around 200KB, this typically reduces to 50-100KB
 * For larger images (1MB+), this can reduce to 200-400KB
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

    // Get image metadata to determine if it's a profile image
    const metadata = await sharp(inputPath).metadata();
    const isSmallImage = metadata.width && metadata.width < 500;
    
    // Use different settings for small images (likely profile images)
    const maxWidth = isSmallImage ? 400 : 1920;
    const quality = isSmallImage ? 75 : 80;

    await sharp(inputPath)
      .resize(maxWidth, null, {
        withoutEnlargement: true, // Don't upscale small images
        fit: 'inside' // Maintain aspect ratio
      })
      .webp({ quality })
      .toFile(outputPath);

    // Get file sizes for logging
    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    
    console.log(
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
  return path.join(compressedDir, `${basename}.webp`);
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

