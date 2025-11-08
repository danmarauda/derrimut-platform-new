#!/usr/bin/env node
/**
 * Get Stripe API Key from Stripe CLI
 * 
 * This script helps get your Stripe API key for .env.local
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔑 Getting Stripe API Key...\n');

try {
  // Try to get from Stripe CLI config
  const config = execSync('stripe config --list', { encoding: 'utf8' });
  
  // Check if we can extract test mode API key
  // Note: Stripe CLI doesn't store the full API key, but we can guide the user
  
  console.log('📋 Stripe CLI Configuration:');
  console.log(config);
  console.log('\n💡 To get your Stripe Secret Key:');
  console.log('   1. Go to: https://dashboard.stripe.com/test/apikeys');
  console.log('   2. Click "Reveal test key" next to "Secret key"');
  console.log('   3. Copy the key (starts with sk_test_...)');
  console.log('   4. Add to .env.local: STRIPE_SECRET_KEY=sk_test_...\n');
  
  // Check .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('STRIPE_SECRET_KEY=')) {
      console.log('✅ STRIPE_SECRET_KEY already in .env.local\n');
    } else {
      console.log('📝 To add it, run:');
      console.log('   echo "STRIPE_SECRET_KEY=sk_test_..." >> .env.local\n');
    }
  } else {
    console.log('📝 Create .env.local and add:');
    console.log('   STRIPE_SECRET_KEY=sk_test_...\n');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Get your Stripe Secret Key from:');
  console.log('   https://dashboard.stripe.com/test/apikeys\n');
}

