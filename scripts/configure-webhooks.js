#!/usr/bin/env node
/**
 * Configure Stripe Webhooks for Convex
 * 
 * This script helps configure Stripe webhooks to point to your Convex endpoint
 * 
 * Prerequisites:
 * 1. Stripe CLI installed: https://stripe.com/docs/stripe-cli
 * 2. Convex deployment URL in .env.local (NEXT_PUBLIC_CONVEX_URL)
 * 3. Stripe CLI logged in: stripe login
 * 
 * Usage:
 *   node scripts/configure-webhooks.js
 */

require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const path = require('path');

function configureWebhooks() {
  console.log('🔧 Configuring Stripe Webhooks for Convex...\n');

  // Check for Convex URL
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error('❌ Error: NEXT_PUBLIC_CONVEX_URL not found in .env.local');
    console.log('💡 Please add NEXT_PUBLIC_CONVEX_URL to your .env.local file');
    process.exit(1);
  }

  // Extract deployment name from URL
  // URL format: https://deployment-name.convex.cloud or https://deployment-name.convex.site
  const urlMatch = convexUrl.match(/https:\/\/([^.]+)\.convex\.(cloud|site)/);
  if (!urlMatch) {
    console.error('❌ Error: Invalid Convex URL format');
    console.log('💡 Expected format: https://deployment-name.convex.cloud or https://deployment-name.convex.site');
    process.exit(1);
  }

  const deploymentName = urlMatch[1];
  const webhookUrl = `https://${deploymentName}.convex.site/stripe-webhook`;

  console.log(`📍 Convex Deployment: ${deploymentName}`);
  console.log(`🔗 Webhook URL: ${webhookUrl}\n`);

  // Check if Stripe CLI is installed
  try {
    execSync('stripe --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Error: Stripe CLI not found');
    console.log('💡 Please install Stripe CLI: https://stripe.com/docs/stripe-cli');
    console.log('   Then run: stripe login');
    process.exit(1);
  }

  console.log('📋 Webhook Configuration Steps:\n');
  console.log('Option 1: Using Stripe Dashboard (Recommended for Production)\n');
  console.log('1. Go to: https://dashboard.stripe.com/webhooks');
  console.log('2. Click "Add endpoint"');
  console.log(`3. Enter endpoint URL: ${webhookUrl}`);
  console.log('4. Select events to listen to:');
  console.log('   - checkout.session.completed');
  console.log('   - customer.subscription.created');
  console.log('   - customer.subscription.updated');
  console.log('   - customer.subscription.deleted');
  console.log('   - invoice.payment_succeeded');
  console.log('   - invoice.payment_failed');
  console.log('5. Click "Add endpoint"');
  console.log('6. Copy the "Signing secret" (starts with whsec_)');
  console.log('7. Add to .env.local: STRIPE_WEBHOOK_SECRET=whsec_...\n');

  console.log('Option 2: Using Stripe CLI (For Testing)\n');
  console.log('Run this command to forward webhooks to Convex:');
  console.log(`stripe listen --forward-to ${webhookUrl}\n`);
  console.log('This will output a webhook signing secret. Add it to .env.local:\n');
  console.log('STRIPE_WEBHOOK_SECRET=whsec_...\n');

  console.log('🧪 Testing Webhook Delivery:\n');
  console.log('After configuring, test with:');
  console.log('stripe trigger checkout.session.completed\n');

  // Offer to create webhook via CLI if user wants
  console.log('💡 Would you like to create a webhook endpoint via Stripe CLI?');
  console.log('   This requires Stripe CLI and API access.\n');
}

configureWebhooks();

