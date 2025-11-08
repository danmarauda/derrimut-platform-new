#!/usr/bin/env node

/**
 * Production-ready Vercel environment variable setup
 * Uses production Convex deployment (spotted-gerbil-236)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Production Environment Setup\n');
console.log('='.repeat(60));
console.log('');

// Production values
// NOTE: Replace these with your actual production keys from .env.local or Clerk Dashboard
const productionEnv = {
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'YOUR_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY': process.env.CLERK_SECRET_KEY || 'YOUR_CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CONVEX_URL': 'https://spotted-gerbil-236.convex.cloud',
  'CONVEX_DEPLOYMENT': 'spotted-gerbil-236',
};

// Read Stripe keys from .env.local if available
const envPath = path.join(__dirname, '..', '.env.local');
let stripeKeys = {};

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
        }
      }
    }
  });
}

console.log('📋 Production Environment Variables:\n');

Object.keys(productionEnv).forEach(key => {
  console.log(`✅ ${key}`);
});

Object.keys(stripeKeys).forEach(key => {
  if (stripeKeys[key]) {
    console.log(`✅ ${key} (from .env.local)`);
  }
});

console.log('\n🚀 Commands to Set in Vercel:\n');
console.log('Copy and run these commands:\n');

// Clerk variables
Object.entries(productionEnv).forEach(([key, value]) => {
  console.log(`echo "${value}" | vercel env add ${key} production`);
});

// Stripe variables (if found)
Object.entries(stripeKeys).forEach(([key, value]) => {
  if (value) {
    console.log(`echo "${value}" | vercel env add ${key} production`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n💡 After setting variables:');
console.log('   1. Deploy: vercel --prod');
console.log('   2. Configure domain: derrimut.aliaslabs.ai');
console.log('   3. Update Clerk: Add derrimut.aliaslabs.ai to allowed origins\n');

