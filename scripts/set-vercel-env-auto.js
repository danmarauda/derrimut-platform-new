#!/usr/bin/env node

/**
 * Automatically set all Vercel production environment variables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting Vercel Production Environment Variables\n');
console.log('='.repeat(60));
console.log('');

// Production values
// NOTE: Clerk keys should be read from .env.local
// These are defaults - scripts will read from .env.local if available
const productionEnv = {
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'YOUR_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY': process.env.CLERK_SECRET_KEY || 'YOUR_CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CONVEX_URL': 'https://spotted-gerbil-236.convex.cloud',
  'CONVEX_DEPLOYMENT': 'spotted-gerbil-236',
};

// Read all keys from .env.local (including Clerk and Stripe)
const envPath = path.join(__dirname, '..', '.env.local');
let stripeKeys = {};
let clerkKeys = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key.includes('STRIPE')) {
          stripeKeys[key.trim()] = value.trim();
        } else if (key.includes('CLERK')) {
          clerkKeys[key.trim()] = value.trim();
        }
      }
    }
  });
}

// Use values from .env.local if available, otherwise use defaults
const allVars = {
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': clerkKeys.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || productionEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  'CLERK_SECRET_KEY': clerkKeys.CLERK_SECRET_KEY || productionEnv.CLERK_SECRET_KEY,
  'NEXT_PUBLIC_CONVEX_URL': productionEnv.NEXT_PUBLIC_CONVEX_URL,
  'CONVEX_DEPLOYMENT': productionEnv.CONVEX_DEPLOYMENT,
  ...stripeKeys
};

console.log('📋 Setting variables in Vercel...\n');

let successCount = 0;
let failCount = 0;

for (const [key, value] of Object.entries(allVars)) {
  try {
    console.log(`Setting ${key}...`);
    
    // Use stdin to pass the value
    execSync(`echo "${value}" | vercel env add ${key} production`, {
      stdio: 'pipe',
    });
    
    console.log(`✅ Set ${key}\n`);
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to set ${key}`);
    console.error(`   Error: ${error.message}\n`);
    failCount++;
  }
}

console.log('='.repeat(60));
console.log(`✅ Successfully set ${successCount} variables`);
if (failCount > 0) {
  console.log(`⚠️  Failed to set ${failCount} variables`);
}
console.log('');

if (successCount > 0) {
  console.log('📋 Next Steps:');
  console.log('   1. Verify: vercel env ls');
  console.log('   2. Deploy: vercel --prod');
  console.log('   3. Configure domain: derrimut.aliaslabs.ai');
  console.log('   4. Update Clerk: Add derrimut.aliaslabs.ai to allowed origins\n');
}

