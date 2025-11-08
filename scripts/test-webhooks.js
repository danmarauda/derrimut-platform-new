#!/usr/bin/env node
/**
 * Test Stripe Webhook Delivery
 * 
 * This script tests webhook delivery to your Convex endpoint
 * 
 * Prerequisites:
 * 1. Stripe CLI installed and logged in
 * 2. Webhook configured (run configure-webhooks.js first)
 * 3. Convex deployment running
 * 
 * Usage:
 *   node scripts/test-webhooks.js [event-type]
 * 
 * Examples:
 *   node scripts/test-webhooks.js checkout.session.completed
 *   node scripts/test-webhooks.js customer.subscription.created
 */

require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');

const eventTypes = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'invoice.payment_succeeded'
];

function testWebhooks() {
  console.log('🧪 Testing Stripe Webhook Delivery...\n');

  // Check if Stripe CLI is installed
  try {
    execSync('stripe --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Error: Stripe CLI not found');
    console.log('💡 Please install Stripe CLI: https://stripe.com/docs/stripe-cli');
    process.exit(1);
  }

  const eventType = process.argv[2] || 'checkout.session.completed';

  if (!eventTypes.includes(eventType)) {
    console.error(`❌ Error: Unknown event type: ${eventType}`);
    console.log(`💡 Available event types: ${eventTypes.join(', ')}`);
    process.exit(1);
  }

  console.log(`📤 Triggering test event: ${eventType}\n`);

  try {
    // Trigger the event
    const output = execSync(`stripe trigger ${eventType}`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    console.log('✅ Event triggered successfully!');
    console.log('\n📋 Output:');
    console.log(output);

    console.log('\n💡 Check your Convex logs to verify the webhook was received:');
    console.log('   npx convex logs\n');

  } catch (error) {
    console.error('❌ Error triggering event:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Stripe CLI is logged in: stripe login');
    console.log('   2. Webhook is configured: node scripts/configure-webhooks.js');
    console.log('   3. Convex deployment is running: npx convex dev');
  }
}

testWebhooks();

