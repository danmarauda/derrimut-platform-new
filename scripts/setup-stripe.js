#!/usr/bin/env node
/**
 * Complete Setup Script
 * 
 * This script runs all setup steps in sequence:
 * 1. Create Stripe products
 * 2. Update product IDs in code
 * 3. Configure webhooks
 * 
 * Usage:
 *   node scripts/setup-stripe.js
 */

require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Derrimut Gym - Complete Stripe Setup\n');
console.log('This script will:');
console.log('1. Create Stripe products and prices');
console.log('2. Update product IDs in code');
console.log('3. Show webhook configuration instructions\n');

// Check prerequisites
console.log('📋 Checking prerequisites...\n');

// Check Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY not found in .env.local');
  process.exit(1);
}
console.log('✅ STRIPE_SECRET_KEY found');

// Check Convex URL
if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  console.error('❌ Error: NEXT_PUBLIC_CONVEX_URL not found in .env.local');
  process.exit(1);
}
console.log('✅ NEXT_PUBLIC_CONVEX_URL found\n');

// Step 1: Create products
console.log('📦 Step 1: Creating Stripe products...\n');
try {
  require('./create-stripe-products.js');
} catch (error) {
  console.error('❌ Error creating products:', error.message);
  process.exit(1);
}

console.log('\n');

// Step 2: Update product IDs
console.log('🔄 Step 2: Updating product IDs in code...\n');
try {
  require('./update-product-ids.js');
} catch (error) {
  console.error('❌ Error updating product IDs:', error.message);
  process.exit(1);
}

console.log('\n');

// Step 3: Configure webhooks
console.log('🔧 Step 3: Webhook configuration...\n');
try {
  require('./configure-webhooks.js');
} catch (error) {
  console.error('❌ Error configuring webhooks:', error.message);
  process.exit(1);
}

console.log('\n✅ Setup complete!\n');
console.log('📋 Next steps:');
console.log('1. Configure webhook in Stripe Dashboard (see instructions above)');
console.log('2. Add STRIPE_WEBHOOK_SECRET to .env.local');
console.log('3. Test webhooks: node scripts/test-webhooks.js');
console.log('4. Test payment flows in your application\n');

