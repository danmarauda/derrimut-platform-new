/**
 * Image Optimization Script
 *
 * Optimizes images in the public directory to reduce bundle size
 * and improve Core Web Vitals scores.
 *
 * Usage: node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OPTIMIZED_DIR = path.join(PUBLIC_DIR, 'optimized');

// Image optimization settings
const OPTIMIZATION_CONFIG = {
  png: {
    quality: 85,
    compressionLevel: 9,
  },
  jpg: {
    quality: 85,
    progressive: true,
  },
  webp: {
    quality: 85,
  },
};

// Target sizes for responsive images
const RESPONSIVE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

/**
 * Create optimized directory if it doesn't exist
 */
function ensureOptimizedDir() {
  if (!fs.existsSync(OPTIMIZED_DIR)) {
    fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
  }
}

/**
 * Get all image files from public directory
 */
function getImageFiles(dir = PUBLIC_DIR) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && item !== 'optimized') {
      files.push(...getImageFiles(fullPath));
    } else if (stat.isFile() && /\.(png|jpe?g|gif)$/i.test(item)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Get file size in KB
 */
function getFileSizeKB(filepath) {
  const stats = fs.statSync(filepath);
  return (stats.size / 1024).toFixed(2);
}

/**
 * Optimize a single image
 */
async function optimizeImage(inputPath) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const ext = path.extname(inputPath).toLowerCase();
  const relativePath = path.relative(PUBLIC_DIR, inputPath);
  const outputDir = path.join(OPTIMIZED_DIR, path.dirname(relativePath));

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const originalSize = getFileSizeKB(inputPath);
  console.log(`\nOptimizing: ${relativePath} (${originalSize} KB)`);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Skip very small images
    if (metadata.width < 100 && metadata.height < 100) {
      console.log(`  ⏭️  Skipping (too small)`);
      return;
    }

    // Generate WebP version (best compression)
    const webpPath = path.join(outputDir, `${filename}.webp`);
    await image
      .webp(OPTIMIZATION_CONFIG.webp)
      .toFile(webpPath);
    console.log(`  ✅ WebP: ${getFileSizeKB(webpPath)} KB`);

    // Optimize original format
    let optimizedPath;
    if (ext === '.png') {
      optimizedPath = path.join(outputDir, `${filename}.png`);
      await sharp(inputPath)
        .png(OPTIMIZATION_CONFIG.png)
        .toFile(optimizedPath);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      optimizedPath = path.join(outputDir, `${filename}.jpg`);
      await sharp(inputPath)
        .jpeg(OPTIMIZATION_CONFIG.jpg)
        .toFile(optimizedPath);
    }

    if (optimizedPath) {
      const optimizedSize = getFileSizeKB(optimizedPath);
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      console.log(`  ✅ Optimized ${ext}: ${optimizedSize} KB (${savings}% reduction)`);
    }

    // Generate responsive sizes for large images
    if (metadata.width > 1000) {
      console.log(`  📐 Generating responsive sizes...`);
      for (const size of RESPONSIVE_SIZES) {
        if (size < metadata.width) {
          const responsivePath = path.join(outputDir, `${filename}-${size}w.webp`);
          await sharp(inputPath)
            .resize(size, null, { withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(responsivePath);
          console.log(`    ✅ ${size}w: ${getFileSizeKB(responsivePath)} KB`);
        }
      }
    }
  } catch (error) {
    console.error(`  ❌ Error optimizing ${relativePath}:`, error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Image Optimization Script\n');
  console.log('📁 Scanning public directory...\n');

  ensureOptimizedDir();
  const imageFiles = getImageFiles();

  console.log(`Found ${imageFiles.length} images to optimize\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (const file of imageFiles) {
    await optimizeImage(file);
  }

  console.log('\n✅ Image optimization complete!');
  console.log(`\n📊 Results:`);
  console.log(`   Images processed: ${imageFiles.length}`);
  console.log(`   Optimized images saved to: /public/optimized/`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review optimized images in /public/optimized/`);
  console.log(`   2. Update image imports to use optimized versions`);
  console.log(`   3. Use Next.js Image component with srcSet for responsive images`);
}

// Run the script
main().catch(console.error);
