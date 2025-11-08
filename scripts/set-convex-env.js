#!/usr/bin/env node

/**
 * Script to set Convex environment variables from .env.local
 * 
 * Usage: bun run scripts/set-convex-env.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Setting Convex Environment Variables\n');

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
      const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
      envVars[key.trim()] = value.trim();
    }
  }
});

// Required Convex environment variables
const requiredVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CLERK_WEBHOOK_SECRET',
  'GEMINI_API_KEY',
];

console.log('📋 Checking required variables...\n');

let missingVars = [];
let foundVars = [];

requiredVars.forEach(varName => {
  if (envVars[varName]) {
    foundVars.push(varName);
    console.log(`✅ Found: ${varName}`);
  } else {
    missingVars.push(varName);
    console.log(`⚠️  Missing: ${varName}`);
  }
});

console.log('');

if (missingVars.length > 0) {
  console.log('⚠️  Some variables are missing from .env.local:');
  missingVars.forEach(v => console.log(`   - ${v}`));
  console.log('');
  console.log('💡 You can set them manually in Convex Dashboard or add them to .env.local first.\n');
}

if (foundVars.length === 0) {
  console.log('❌ No environment variables found to set!\n');
  process.exit(1);
}

console.log('🚀 Setting environment variables in Convex...\n');

// Set each variable in Convex
foundVars.forEach(varName => {
  try {
    const value = envVars[varName];
    console.log(`Setting ${varName}...`);
    
    // Use Convex CLI to set the variable
    execSync(`bunx convex env set ${varName} "${value}"`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    
    console.log(`✅ Set ${varName}\n`);
  } catch (error) {
    console.error(`❌ Failed to set ${varName}:`, error.message);
    console.error('💡 You may need to set it manually in Convex Dashboard\n');
  }
});

console.log('✅ Done!\n');
console.log('📋 Next steps:');
console.log('   1. Verify variables in Convex Dashboard: Settings > Environment Variables');
console.log('   2. Test webhook: bun run stripe:test-webhooks');
console.log('   3. Check Convex logs: bunx convex logs --history 20\n');

