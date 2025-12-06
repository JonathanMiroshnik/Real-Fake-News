import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { compressImageForWeb, getCompressedImagePath } from '../utils/imageCompression.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Script to compress all existing images in the images directory
 * This creates compressed versions while keeping originals intact
 */
async function compressAllImages() {
  const imagesDir = path.join(__dirname, '../../data/images');
  const compressedDir = path.join(imagesDir, 'compressed');
  
  // Create compressed directory if it doesn't exist
  fs.mkdirSync(compressedDir, { recursive: true });

  // Get all image files (excluding the compressed directory itself)
  const files = fs.readdirSync(imagesDir).filter(file => {
    const filePath = path.join(imagesDir, file);
    const stat = fs.statSync(filePath);
    return stat.isFile() && /\.(png|jpg|jpeg|webp|gif)$/i.test(file);
  });

  console.log(`Found ${files.length} images to compress...\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const inputPath = path.join(imagesDir, file);
      const outputPath = getCompressedImagePath(file);
      
      // Skip if compressed version already exists
      if (fs.existsSync(outputPath)) {
        console.log(`Skipping ${file} (compressed version already exists)`);
        skipCount++;
        continue;
      }

      await compressImageForWeb(inputPath, outputPath);
      successCount++;
    } catch (error) {
      console.error(`Failed to compress ${file}:`, error);
      errorCount++;
    }
  }

  console.log(`\n=== Compression Complete ===`);
  console.log(`Successfully compressed: ${successCount}`);
  console.log(`Skipped (already exists): ${skipCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total processed: ${files.length}`);
}

// Run the script
compressAllImages().catch(console.error);

