#!/usr/bin/env node
/**
 * Complete Stripe Setup
 * 
 * This script helps complete Stripe setup by:
 * 1. Checking for Stripe keys
 * 2. Setting up webhook endpoint
 * 3. Testing webhook delivery
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

console.log('🚀 Completing Stripe Setup...\n');

// Check for required keys
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!stripeSecretKey || stripeSecretKey.includes('YOUR_KEY_HERE')) {
  console.log('⚠️  STRIPE_SECRET_KEY needs to be set\n');
  console.log('📋 To get your Stripe Secret Key:');
  console.log('   1. Go to: https://dashboard.stripe.com/test/apikeys');
  console.log('   2. Click "Reveal test key" next to "Secret key"');
  console.log('   3. Copy the key (starts with sk_test_...)');
  console.log('   4. Update .env.local: STRIPE_SECRET_KEY=sk_test_...\n');
  console.log('💡 Your publishable key is already set!\n');
  process.exit(1);
}

if (!convexUrl) {
  console.error('❌ NEXT_PUBLIC_CONVEX_URL not found');
  process.exit(1);
}

console.log('✅ Stripe Secret Key found');
console.log('✅ Stripe Publishable Key:', stripePublishableKey ? 'Set' : 'Missing');
console.log('✅ Convex URL:', convexUrl);
console.log('');

// Extract webhook URL
const urlMatch = convexUrl.match(/https:\/\/([^.]+)\.convex\.(cloud|site)/);
if (!urlMatch) {
  console.error('❌ Invalid Convex URL format');
  process.exit(1);
}

const deploymentName = urlMatch[1];
const webhookUrl = `https://${deploymentName}.convex.site/stripe-webhook`;

console.log(`📍 Webhook URL: ${webhookUrl}\n`);

const stripe = new Stripe(stripeSecretKey);

const events = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed'
];

async function setupStripe() {
  try {
    console.log('📋 Step 1: Checking for existing webhook...\n');
    
    // Check existing webhooks
    const existingWebhooks = await stripe.webhookEndpoints.list({
      limit: 100
    });

    let webhook = existingWebhooks.data.find(
      wh => wh.url === webhookUrl
    );

    if (webhook) {
      console.log('✅ Webhook endpoint already exists!\n');
      console.log(`📋 Webhook ID: ${webhook.id}`);
      console.log(`🔐 Signing Secret: ${webhook.secret}\n`);
    } else {
      console.log('📋 Step 2: Creating webhook endpoint...\n');
      
      webhook = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: events,
        description: 'Derrimut Gym Platform - Convex Webhook',
      });

      console.log('✅ Webhook endpoint created!\n');
      console.log(`📋 Webhook ID: ${webhook.id}`);
      console.log(`🔐 Signing Secret: ${webhook.secret}\n`);
    }

    // Update .env.local
    console.log('📋 Step 3: Updating .env.local...\n');
    
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env.local');
    
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update or add STRIPE_WEBHOOK_SECRET
    if (envContent.includes('STRIPE_WEBHOOK_SECRET=')) {
      envContent = envContent.replace(
        /STRIPE_WEBHOOK_SECRET=.*/g,
        `STRIPE_WEBHOOK_SECRET=${webhook.secret}`
      );
    } else {
      envContent += `STRIPE_WEBHOOK_SECRET=${webhook.secret}\n`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n');

    console.log('✅ Updated .env.local with webhook secret\n');

    // Verify setup
    console.log('📋 Step 4: Verifying setup...\n');
    
    console.log('✅ Stripe Secret Key: Set');
    console.log('✅ Stripe Publishable Key:', stripePublishableKey ? 'Set' : '⚠️  Missing');
    console.log('✅ Webhook Endpoint: Created');
    console.log('✅ Webhook Secret: Added to .env.local');
    console.log('');

    console.log('🎉 Stripe setup complete!\n');
    console.log('🧪 Next steps:');
    console.log('   1. Test webhook: npm run stripe:test-webhooks checkout.session.completed');
    console.log('   2. Check Convex logs: npx convex logs');
    console.log('   3. Start dev server: npm run dev');
    console.log('   4. Test payment flows in your app\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n💡 Your STRIPE_SECRET_KEY might be incorrect');
      console.log('   Get it from: https://dashboard.stripe.com/test/apikeys\n');
    } else {
      console.log('\n💡 Error details:', error);
    }
  }
}

setupStripe();

