#!/usr/bin/env node

/**
 * Create Logo Variants from Primary Logo
 * 
 * This script creates white, icon, and favicon variants from the primary logo
 * Requires: ImageMagick (convert) or macOS sips command
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '..', 'public', 'logos');
const publicDir = path.join(__dirname, '..', 'public');
const primaryLogo = path.join(logosDir, 'derrimut-logo-primary.png');

console.log('🎨 Creating Derrimut Logo Variants\n');
console.log('='.repeat(60));
console.log('');

if (!fs.existsSync(primaryLogo)) {
  console.error('❌ Primary logo not found:', primaryLogo);
  console.log('\n💡 Please download the logo first from:');
  console.log('   https://www.derrimut247.com.au');
  process.exit(1);
}

// Check for ImageMagick or sips
const hasImageMagick = execSync('which convert', { encoding: 'utf8', stdio: 'pipe' }).trim();
const hasSips = execSync('which sips', { encoding: 'utf8', stdio: 'pipe' }).trim();

if (!hasImageMagick && !hasSips) {
  console.log('⚠️  Image processing tools not found');
  console.log('\n📝 Manual Steps:');
  console.log('   1. White Logo:');
  console.log('      - Open derrimut-logo-primary.png in image editor');
  console.log('      - Apply white filter or invert colors');
  console.log('      - Save as: public/logos/derrimut-logo-white.png\n');
  console.log('   2. Icon (64x64px):');
  console.log('      - Resize to 64x64px');
  console.log('      - Save as: public/logos/derrimut-icon.png\n');
  console.log('   3. Favicon (32x32px → .ico):');
  console.log('      - Resize icon to 32x32px');
  console.log('      - Convert to .ico');
  console.log('      - Save as: public/favicon.ico\n');
  console.log('💡 Online Tools:');
  console.log('   - Resize: https://www.iloveimg.com/resize-image');
  console.log('   - Convert: https://convertio.co/png-ico/\n');
  process.exit(0);
}

console.log('✅ Image processing tool found:', hasImageMagick ? 'ImageMagick' : 'sips');
console.log('');

try {
  // Create white logo (invert colors)
  if (hasImageMagick) {
    console.log('📝 Creating white logo variant...');
    execSync(`convert "${primaryLogo}" -negate "${path.join(logosDir, 'derrimut-logo-white.png')}"`, { stdio: 'inherit' });
    console.log('✅ White logo created\n');
  } else if (hasSips) {
    console.log('📝 Creating white logo variant (using sips)...');
    // sips doesn't have invert, so we'll copy and note manual step needed
    fs.copyFileSync(primaryLogo, path.join(logosDir, 'derrimut-logo-white.png'));
    console.log('⚠️  White logo copied (manual inversion needed)\n');
  }
  
  // Create icon (64x64px)
  console.log('📝 Creating icon (64x64px)...');
  if (hasImageMagick) {
    execSync(`convert "${primaryLogo}" -resize 64x64 -background transparent -gravity center -extent 64x64 "${path.join(logosDir, 'derrimut-icon.png')}"`, { stdio: 'inherit' });
  } else if (hasSips) {
    execSync(`sips -z 64 64 "${primaryLogo}" --out "${path.join(logosDir, 'derrimut-icon.png')}"`, { stdio: 'inherit' });
  }
  console.log('✅ Icon created\n');
  
  // Create favicon (32x32px)
  console.log('📝 Creating favicon (32x32px)...');
  const iconPath = path.join(logosDir, 'derrimut-icon.png');
  if (hasImageMagick) {
    execSync(`convert "${iconPath}" -resize 32x32 "${path.join(publicDir, 'favicon.ico')}"`, { stdio: 'inherit' });
  } else if (hasSips) {
    execSync(`sips -z 32 32 "${iconPath}" --out "${path.join(publicDir, 'favicon.png')}"`, { stdio: 'inherit' });
    console.log('⚠️  Created favicon.png (convert to .ico manually)');
  }
  console.log('✅ Favicon created\n');
  
  console.log('✅ All logo variants created!');
  console.log('\n📋 Files created:');
  console.log('   ✅ derrimut-logo-primary.png');
  console.log('   ✅ derrimut-logo-white.png');
  console.log('   ✅ derrimut-icon.png');
  console.log('   ✅ favicon.ico (or .png)\n');
  
} catch (error) {
  console.error('❌ Error creating variants:', error.message);
  console.log('\n💡 See manual steps above');
}

