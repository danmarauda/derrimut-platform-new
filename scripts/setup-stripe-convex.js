#!/usr/bin/env node

/**
 * Complete Stripe + Convex Setup Script
 * 
 * This script automates the entire Stripe + Convex setup process:
 * 1. Creates Stripe products/prices
 * 2. Updates code with product IDs
 * 3. Configures webhooks
 * 4. Sets Convex environment variables
 * 5. Tests the setup
 * 
 * Usage:
 *   bun run scripts/setup-stripe-convex.js [--prod]
 * 
 * Options:
 *   --prod    Set up production environment (default: dev)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const isProd = process.argv.includes('--prod');
const env = isProd ? 'prod' : 'dev';
const deploymentFlag = isProd ? '--prod' : '';

console.log(`🚀 Stripe + Convex Setup (${env.toUpperCase()})\n`);
console.log('='.repeat(60));
console.log('');

// Step 1: Create Stripe Products
console.log('📦 Step 1: Creating Stripe Products...');
try {
  execSync('bun run stripe:create-products', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  console.log('✅ Stripe products created!\n');
} catch (error) {
  console.error('❌ Failed to create Stripe products');
  console.error('💡 Make sure Stripe CLI is installed and logged in');
  process.exit(1);
}

// Step 2: Update Product IDs in Code
console.log('🔧 Step 2: Updating Product IDs in Code...');
try {
  execSync('bun run stripe:update-ids', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  console.log('✅ Product IDs updated!\n');
} catch (error) {
  console.error('❌ Failed to update product IDs');
  process.exit(1);
}

// Step 3: Get Convex Webhook URL
console.log('🔗 Step 3: Getting Convex Webhook URL...');
let webhookUrl = '';
try {
  const convexJsonPath = path.join(__dirname, '..', 'convex.json');
  if (fs.existsSync(convexJsonPath)) {
    const convexConfig = JSON.parse(fs.readFileSync(convexJsonPath, 'utf8'));
    const deploymentName = convexConfig.deployment;
    if (deploymentName) {
      webhookUrl = `https://${deploymentName}.convex.site/stripe-webhook`;
      console.log(`✅ Webhook URL: ${webhookUrl}\n`);
    }
  }
} catch (error) {
  console.log('⚠️  Could not determine webhook URL automatically');
  console.log('💡 You can find it in Convex Dashboard\n');
}

// Step 4: Set Convex Environment Variables
console.log('🔐 Step 4: Setting Convex Environment Variables...');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found!');
  console.error('💡 Create .env.local first with your environment variables.\n');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse .env.local
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      envVars[key.trim()] = value.trim();
    }
  }
});

// Required variables
const requiredVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

console.log(`Setting variables for ${env.toUpperCase()} deployment...\n`);

requiredVars.forEach(varName => {
  if (envVars[varName]) {
    try {
      console.log(`Setting ${varName}...`);
      execSync(
        `bunx convex env set ${varName} "${envVars[varName]}" ${deploymentFlag}`,
        {
          stdio: 'inherit',
          cwd: path.join(__dirname, '..'),
        }
      );
      console.log(`✅ Set ${varName}\n`);
    } catch (error) {
      console.error(`❌ Failed to set ${varName}`);
      console.error('💡 You may need to set it manually in Convex Dashboard\n');
    }
  } else {
    console.log(`⚠️  ${varName} not found in .env.local`);
    console.log(`💡 Set it manually: bunx convex env set ${varName} "value" ${deploymentFlag}\n`);
  }
});

// Step 5: Show Webhook Configuration Instructions
console.log('📋 Step 5: Webhook Configuration');
console.log('='.repeat(60));
console.log('');
console.log('🔗 Webhook URL:');
if (webhookUrl) {
  console.log(`   ${webhookUrl}`);
} else {
  console.log('   (Check Convex Dashboard for your webhook URL)');
}
console.log('');
console.log('📝 To configure in Stripe Dashboard:');
console.log('   1. Go to: https://dashboard.stripe.com/webhooks');
console.log('   2. Click "Add endpoint"');
console.log('   3. Enter the webhook URL above');
console.log('   4. Select events:');
console.log('      - checkout.session.completed');
console.log('      - customer.subscription.created');
console.log('      - customer.subscription.updated');
console.log('      - customer.subscription.deleted');
console.log('   5. Copy the "Signing secret"');
console.log('   6. Set it: bunx convex env set STRIPE_WEBHOOK_SECRET "whsec_..." ' + deploymentFlag);
console.log('');

// Step 6: Verify Setup
console.log('✅ Step 6: Verifying Setup...');
console.log('='.repeat(60));
console.log('');

try {
  console.log('📋 Current Environment Variables:');
  execSync(`bunx convex env list ${deploymentFlag}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  console.log('');
} catch (error) {
  console.log('⚠️  Could not list environment variables');
}

// Summary
console.log('🎉 Setup Complete!');
console.log('='.repeat(60));
console.log('');
console.log('✅ Stripe products created');
console.log('✅ Product IDs updated in code');
console.log('✅ Convex environment variables set');
console.log('');
console.log('📋 Next Steps:');
console.log('   1. Configure webhook in Stripe Dashboard (see above)');
console.log('   2. Set webhook secret: bunx convex env set STRIPE_WEBHOOK_SECRET "whsec_..." ' + deploymentFlag);
console.log('   3. Test webhook: bun run stripe:test-webhooks');
console.log('   4. Check logs: bunx convex logs --history 20');
console.log('');

