#!/usr/bin/env node
/**
 * Setup Stripe Webhook Endpoint
 * 
 * Creates a webhook endpoint in Stripe pointing to your Convex deployment
 * Uses Stripe API (requires STRIPE_SECRET_KEY)
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

console.log('🔧 Setting up Stripe Webhook Endpoint...\n');

const webhookUrl = 'https://enchanted-salamander-914.convex.site/stripe-webhook';

console.log(`📍 Webhook URL: ${webhookUrl}\n`);

// Check for Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  console.log('\n💡 Manual Setup Instructions:');
  console.log('   1. Go to: https://dashboard.stripe.com/webhooks');
  console.log(`   2. Click "Add endpoint"`);
  console.log(`   3. Enter URL: ${webhookUrl}`);
  console.log('   4. Select events:');
  console.log('      - checkout.session.completed');
  console.log('      - customer.subscription.created');
  console.log('      - customer.subscription.updated');
  console.log('      - customer.subscription.deleted');
  console.log('      - invoice.payment_succeeded');
  console.log('      - invoice.payment_failed');
  console.log('   5. Copy the signing secret to .env.local\n');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const events = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed'
];

async function createWebhook() {
  try {
    console.log('📋 Creating webhook endpoint...\n');

    // Check if webhook already exists
    const existingWebhooks = await stripe.webhookEndpoints.list({
      limit: 100
    });

    const existing = existingWebhooks.data.find(
      wh => wh.url === webhookUrl
    );

    if (existing) {
      console.log('✅ Webhook endpoint already exists!\n');
      console.log(`📋 Webhook ID: ${existing.id}`);
      console.log(`🔐 Signing Secret: ${existing.secret}\n`);

      // Update .env.local
      updateEnvFile(existing.secret);
      return;
    }

    // Create new webhook
    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: events,
    });

    console.log('✅ Webhook endpoint created!\n');
    console.log(`📋 Webhook ID: ${webhook.id}`);
    console.log(`🔐 Signing Secret: ${webhook.secret}\n`);

    // Update .env.local
    updateEnvFile(webhook.secret);

    console.log('✅ Updated .env.local with webhook secret\n');
    console.log('🧪 Test webhook delivery:');
    console.log('   npm run stripe:test-webhooks checkout.session.completed\n');

  } catch (error) {
    console.error('❌ Error creating webhook:', error.message);
    console.log('\n💡 Manual Setup Instructions:');
    console.log('   1. Go to: https://dashboard.stripe.com/webhooks');
    console.log(`   2. Click "Add endpoint"`);
    console.log(`   3. Enter URL: ${webhookUrl}`);
    console.log('   4. Select events listed above');
    console.log('   5. Copy signing secret to .env.local\n');
  }
}

function updateEnvFile(secret) {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env.local');
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Update or add STRIPE_WEBHOOK_SECRET
  if (envContent.includes('STRIPE_WEBHOOK_SECRET=')) {
    envContent = envContent.replace(
      /STRIPE_WEBHOOK_SECRET=.*/g,
      `STRIPE_WEBHOOK_SECRET=${secret}`
    );
  } else {
    envContent += `\nSTRIPE_WEBHOOK_SECRET=${secret}\n`;
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n');
}

createWebhook();

