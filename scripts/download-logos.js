#!/usr/bin/env node

/**
 * Download Derrimut Logo Assets
 * 
 * This script downloads the Derrimut logo from SeekLogo and creates variants
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '..', 'public', 'logos');
const publicDir = path.join(__dirname, '..', 'public');

// Ensure directories exist
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

console.log('🎨 Derrimut Logo Download Script\n');
console.log('='.repeat(60));
console.log('');

// SeekLogo direct PNG URL (from research)
const logoUrl = 'https://seeklogo.com/images/D/derrimut-247-gym-logo-2264684E96-seeklogo.com.png';

console.log('📥 Downloading logo from SeekLogo...');
console.log(`   URL: ${logoUrl}\n`);

const file = fs.createWriteStream(path.join(logosDir, 'derrimut-logo-seeklogo.png'));

https.get(logoUrl, (response) => {
  if (response.statusCode === 200) {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('✅ Primary logo downloaded successfully!');
      console.log(`   Saved to: ${path.join(logosDir, 'derrimut-logo-seeklogo.png')}\n`);
      
      console.log('📝 Next Steps (Manual):');
      console.log('   1. Create white variant:');
      console.log('      - Open logo in image editor');
      console.log('      - Apply white filter or invert colors');
      console.log('      - Save as: public/logos/derrimut-logo-white.png\n');
      console.log('   2. Create icon version:');
      console.log('      - Resize logo to 64x64px');
      console.log('      - Save as: public/logos/derrimut-icon.png\n');
      console.log('   3. Create favicon:');
      console.log('      - Use icon version or create 32x32px version');
      console.log('      - Convert to .ico format');
      console.log('      - Save as: public/favicon.ico\n');
      console.log('💡 Online Tools:');
      console.log('   - Resize: https://www.iloveimg.com/resize-image');
      console.log('   - Convert to ICO: https://convertio.co/png-ico/\n');
    });
  } else {
    console.error(`❌ Failed to download logo. Status: ${response.statusCode}`);
    console.log('\n💡 Manual Download Instructions:');
    console.log('   1. Visit: https://seeklogo.com/vector-logo/226468/derrimut-247-gym');
    console.log('   2. Right-click logo → Save image as');
    console.log('   3. Save to: public/logos/derrimut-logo-seeklogo.png\n');
  }
}).on('error', (err) => {
  console.error(`❌ Error downloading logo: ${err.message}`);
  console.log('\n💡 Manual Download Instructions:');
  console.log('   1. Visit: https://seeklogo.com/vector-logo/226468/derrimut-247-gym');
  console.log('   2. Right-click logo → Save image as');
  console.log('   3. Save to: public/logos/derrimut-logo-seeklogo.png\n');
});

