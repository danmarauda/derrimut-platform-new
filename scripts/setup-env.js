#!/usr/bin/env node
/**
 * Setup Helper - Get Stripe API Key and Create .env.local
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Stripe Setup Helper\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env.local already exists');
  require('dotenv').config({ path: envPath });
  
  if (process.env.STRIPE_SECRET_KEY) {
    console.log('✅ STRIPE_SECRET_KEY is set\n');
  } else {
    console.log('⚠️ STRIPE_SECRET_KEY not found in .env.local\n');
  }
} else {
  console.log('📝 Creating .env.local file...\n');
}

// Get Stripe API key from user or Stripe CLI
console.log('To get your Stripe API key:');
console.log('1. Go to: https://dashboard.stripe.com/test/apikeys');
console.log('2. Copy your "Secret key" (starts with sk_test_...)');
console.log('3. Or use Stripe CLI: stripe config --get test_mode_api_key\n');

// Try to get from Stripe CLI
try {
  const apiKey = execSync('stripe config --get test_mode_api_key', { encoding: 'utf8' }).trim();
  if (apiKey && apiKey.startsWith('sk_test_')) {
    console.log(`✅ Found API key from Stripe CLI: ${apiKey.substring(0, 20)}...\n`);
    
    // Create or update .env.local
    let envContent = '';
    if (envExists) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add STRIPE_SECRET_KEY
    if (envContent.includes('STRIPE_SECRET_KEY=')) {
      envContent = envContent.replace(/STRIPE_SECRET_KEY=.*/g, `STRIPE_SECRET_KEY=${apiKey}`);
    } else {
      envContent += `\nSTRIPE_SECRET_KEY=${apiKey}\n`;
    }
    
    // Add NEXT_PUBLIC_CONVEX_URL if not present
    if (!envContent.includes('NEXT_PUBLIC_CONVEX_URL=')) {
      envContent += `NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.site\n`;
    }
    
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('✅ Updated .env.local with Stripe API key\n');
    
    // Reload env
    require('dotenv').config({ path: envPath });
    
  } else {
    console.log('⚠️ Could not get API key from Stripe CLI');
    console.log('💡 Please add STRIPE_SECRET_KEY to .env.local manually\n');
  }
} catch (error) {
  console.log('⚠️ Could not get API key from Stripe CLI');
  console.log('💡 Please add STRIPE_SECRET_KEY to .env.local manually\n');
}

// Check Convex URL
if (process.env.NEXT_PUBLIC_CONVEX_URL) {
  console.log(`✅ NEXT_PUBLIC_CONVEX_URL: ${process.env.NEXT_PUBLIC_CONVEX_URL}\n`);
} else {
  console.log('⚠️ NEXT_PUBLIC_CONVEX_URL not set');
  console.log('💡 Add it to .env.local: NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.site\n');
}

// Test if we can now run the create products script
if (process.env.STRIPE_SECRET_KEY) {
  console.log('🧪 Testing product creation script...\n');
  try {
    require('./create-stripe-products.js');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
} else {
  console.log('📋 Next steps:');
  console.log('1. Add STRIPE_SECRET_KEY to .env.local');
  console.log('2. Add NEXT_PUBLIC_CONVEX_URL to .env.local');
  console.log('3. Run: npm run stripe:create-products\n');
}

