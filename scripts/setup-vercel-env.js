#!/usr/bin/env node

/**
 * Script to help set Vercel environment variables for production
 * Reads from .env.local and provides commands to set in Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Production Environment Setup Helper\n');
console.log('='.repeat(60));
console.log('');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
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
}

// Production defaults
const productionDefaults = {
  'NEXT_PUBLIC_CONVEX_URL': 'https://spotted-gerbil-236.convex.cloud',
  'CONVEX_DEPLOYMENT': 'spotted-gerbil-236',
};

const requiredVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CONVEX_URL',
  'CONVEX_DEPLOYMENT',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

console.log('📋 Environment Variables Found:\n');

requiredVars.forEach(varName => {
  const value = envVars[varName] || productionDefaults[varName];
  if (value) {
    console.log(`✅ ${varName}`);
  } else {
    console.log(`⚠️  ${varName} (missing)`);
  }
});

console.log('\n🚀 Commands to Set in Vercel:\n');
console.log('Run these commands one by one:\n');

requiredVars.forEach(varName => {
  const value = envVars[varName] || productionDefaults[varName];
  if (value) {
    console.log(`echo "${value}" | vercel env add ${varName} production`);
  } else {
    console.log(`# ${varName} - SET MANUALLY`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n💡 Or set manually via Vercel Dashboard:');
console.log('   https://vercel.com/dashboard → Project → Settings → Environment Variables\n');

