#!/usr/bin/env node
/**
 * Extract Stripe API Key from Stripe CLI Config
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔑 Extracting Stripe API Key from CLI config...\n');

try {
  // Get config
  const configOutput = execSync('stripe config --list', { encoding: 'utf8' });
  
  // Extract test mode API key
  const keyMatch = configOutput.match(/test_mode_api_key\s*=\s*'([^']+)'/);
  
  if (keyMatch && keyMatch[1]) {
    const apiKey = keyMatch[1];
    console.log('✅ Found Stripe API Key from CLI config\n');
    
    // Update .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update STRIPE_SECRET_KEY
    if (envContent.includes('STRIPE_SECRET_KEY=')) {
      envContent = envContent.replace(
        /STRIPE_SECRET_KEY=.*/g,
        `STRIPE_SECRET_KEY=${apiKey}`
      );
      console.log('✅ Updated STRIPE_SECRET_KEY in .env.local\n');
    } else {
      envContent += `STRIPE_SECRET_KEY=${apiKey}\n`;
      console.log('✅ Added STRIPE_SECRET_KEY to .env.local\n');
    }
    
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    
    console.log('💡 Next: Run node scripts/complete-stripe-setup.js\n');
    
  } else {
    console.log('⚠️  Could not extract API key from CLI config');
    console.log('💡 Get it manually from: https://dashboard.stripe.com/test/apikeys\n');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

