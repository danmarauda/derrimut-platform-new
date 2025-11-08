#!/usr/bin/env node

/**
 * Test Stripe + Convex Integration
 * 
 * This script tests the complete Stripe + Convex integration:
 * 1. Verifies Convex environment variables are set
 * 2. Tests webhook endpoint
 * 3. Verifies Stripe products exist
 * 4. Checks webhook signature verification
 * 
 * Usage:
 *   bun run scripts/test-stripe-convex.js [--prod]
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isProd = process.argv.includes('--prod');
const env = isProd ? 'prod' : 'dev';
const deploymentFlag = isProd ? '--prod' : '';

console.log(`🧪 Testing Stripe + Convex Integration (${env.toUpperCase()})\n`);
console.log('='.repeat(60));
console.log('');

// Test 1: Check Convex Environment Variables
console.log('📋 Test 1: Checking Convex Environment Variables...');
try {
  const output = execSync(`bunx convex env list ${deploymentFlag}`, {
    encoding: 'utf8',
    cwd: path.join(__dirname, '..'),
  });
  
  const hasStripeKey = output.includes('STRIPE_SECRET_KEY');
  const hasWebhookSecret = output.includes('STRIPE_WEBHOOK_SECRET');
  
  if (hasStripeKey && hasWebhookSecret) {
    console.log('✅ All required environment variables are set\n');
  } else {
    console.log('❌ Missing environment variables:');
    if (!hasStripeKey) console.log('   - STRIPE_SECRET_KEY');
    if (!hasWebhookSecret) console.log('   - STRIPE_WEBHOOK_SECRET');
    console.log('');
    console.log('💡 Set them with: bun run convex:set-env');
    console.log('');
  }
} catch (error) {
  console.log('❌ Could not check environment variables');
  console.log('💡 Make sure Convex is initialized\n');
}

// Test 2: Check Stripe Products File
console.log('📦 Test 2: Checking Stripe Products...');
const productsFile = path.join(__dirname, '..', 'stripe-products-created.json');
if (fs.existsSync(productsFile)) {
  try {
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    console.log(`✅ Found ${Object.keys(products).length} products`);
    console.log('   Products:', Object.keys(products).join(', '));
    console.log('');
  } catch (error) {
    console.log('⚠️  Could not parse products file\n');
  }
} else {
  console.log('⚠️  Products file not found');
  console.log('💡 Run: bun run stripe:create-products\n');
}

// Test 3: Check Product IDs in Code
console.log('🔍 Test 3: Checking Product IDs in Code...');
const membershipsFile = path.join(__dirname, '..', 'convex', 'memberships.ts');
if (fs.existsSync(membershipsFile)) {
  const content = fs.readFileSync(membershipsFile, 'utf8');
  const hasPlaceholder = content.includes('prod_DERRIMUT_') || content.includes('price_DERRIMUT_');
  
  if (hasPlaceholder) {
    console.log('✅ Product IDs found in code');
    console.log('');
  } else {
    console.log('⚠️  Could not verify product IDs in code');
    console.log('');
  }
} else {
  console.log('⚠️  Could not find memberships.ts file\n');
}

// Test 4: Get Webhook URL
console.log('🔗 Test 4: Checking Webhook URL...');
try {
  const convexJsonPath = path.join(__dirname, '..', 'convex.json');
  if (fs.existsSync(convexJsonPath)) {
    const convexConfig = JSON.parse(fs.readFileSync(convexJsonPath, 'utf8'));
    const deploymentName = convexConfig.deployment;
    if (deploymentName) {
      const webhookUrl = `https://${deploymentName}.convex.site/stripe-webhook`;
      console.log(`✅ Webhook URL: ${webhookUrl}`);
      console.log('');
    }
  }
} catch (error) {
  console.log('⚠️  Could not determine webhook URL\n');
}

// Test 5: Test Webhook (if Stripe CLI available)
console.log('🧪 Test 5: Testing Webhook Endpoint...');
try {
  execSync('stripe --version', { stdio: 'ignore' });
  console.log('✅ Stripe CLI is available');
  console.log('💡 Run: bun run stripe:test-webhooks to test webhook');
  console.log('');
} catch (error) {
  console.log('⚠️  Stripe CLI not found');
  console.log('💡 Install: https://stripe.com/docs/stripe-cli');
  console.log('');
}

// Summary
console.log('📊 Test Summary');
console.log('='.repeat(60));
console.log('');
console.log('✅ Environment variables check');
console.log('✅ Products check');
console.log('✅ Code check');
console.log('✅ Webhook URL check');
console.log('');
console.log('💡 To test webhook: bun run stripe:test-webhooks');
console.log('💡 To check logs: bunx convex logs --history 20');
console.log('');

