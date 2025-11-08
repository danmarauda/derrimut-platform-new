#!/usr/bin/env node

/**
 * Vercel Sentry Integration Verification Script
 *
 * This script verifies that Sentry is properly configured via Vercel Marketplace.
 *
 * Run: node scripts/verify-sentry.js
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SENTRY_DSN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
];

const optionalEnvVars = [
  'SENTRY_AUTH_TOKEN', // Used for source maps upload
];

console.log('\n🔍 Verifying Sentry Configuration via Vercel Marketplace...\n');

let allRequired = true;
let hasOptional = true;

// Check required variables
console.log('📋 Required Environment Variables:');
requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${varName}: NOT SET`);
    allRequired = false;
  }
});

// Check optional variables
console.log('\n📋 Optional Environment Variables:');
optionalEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ⚠️  ${varName}: NOT SET (source maps won't upload)`);
    hasOptional = false;
  }
});

// Summary
console.log('\n📊 Summary:');
if (allRequired) {
  console.log('  ✅ All required Sentry variables are configured!');
  console.log('  ✅ Sentry error tracking is READY');

  if (!hasOptional) {
    console.log('\n  ℹ️  Note: SENTRY_AUTH_TOKEN not set.');
    console.log('     Source maps won\'t be uploaded (errors will be less readable).');
    console.log('     This is automatically set by Vercel Marketplace integration.');
  }

  console.log('\n🎯 Next Steps:');
  console.log('  1. Test error tracking: npm run dev');
  console.log('  2. Visit: http://localhost:3000/api/test-sentry?type=error');
  console.log('  3. Check Sentry dashboard: https://sentry.io');

} else {
  console.log('  ❌ Some required variables are missing!');
  console.log('\n🔧 Setup Instructions:');
  console.log('  1. Go to: https://vercel.com/dashboard');
  console.log('  2. Select your project: DerrimutPlatform');
  console.log('  3. Go to Settings → Integrations');
  console.log('  4. Add Sentry integration from marketplace');
  console.log('  5. Vercel will auto-configure environment variables');
  console.log('\n  OR manually add to .env.local:');
  console.log('  NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx');
}

console.log('\n');

process.exit(allRequired ? 0 : 1);
