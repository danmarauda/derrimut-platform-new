#!/usr/bin/env node

/**
 * Script to set Convex environment variables for BOTH dev and prod deployments
 * Reads from .env.local and sets in both environments
 * 
 * Usage: 
 *   bun run scripts/set-convex-env-all.js
 *   bun run scripts/set-convex-env-all.js --prod-only  (only prod)
 *   bun run scripts/set-convex-env-all.js --dev-only   (only dev)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const prodOnly = args.includes('--prod-only');
const devOnly = args.includes('--dev-only');

console.log('🔧 Setting Convex Environment Variables for All Deployments\n');
console.log('='.repeat(60));
console.log('');

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

// Required Convex environment variables (these are used in Convex functions)
const convexVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CLERK_WEBHOOK_SECRET',
  'GEMINI_API_KEY',
];

console.log('📋 Checking required variables in .env.local...\n');

let missingVars = [];
let foundVars = [];

convexVars.forEach(varName => {
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
  console.log('💡 These will be skipped. You can add them to .env.local or set them manually.\n');
}

if (foundVars.length === 0) {
  console.log('❌ No environment variables found to set!\n');
  process.exit(1);
}

// Set variables for each deployment
const deployments = [];

if (!prodOnly) {
  deployments.push({ name: 'DEV', flag: '' });
}

if (!devOnly) {
  deployments.push({ name: 'PROD', flag: '--prod' });
}

deployments.forEach(deployment => {
  console.log(`\n🚀 Setting environment variables for ${deployment.name} deployment...\n`);
  console.log('-'.repeat(60));
  
  foundVars.forEach(varName => {
    try {
      const value = envVars[varName];
      console.log(`Setting ${varName} in ${deployment.name}...`);
      
      // Use Convex CLI to set the variable
      const command = `bunx convex env set ${varName} "${value}" ${deployment.flag}`.trim();
      execSync(command, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
      });
      
      console.log(`✅ Set ${varName} in ${deployment.name}\n`);
    } catch (error) {
      console.error(`❌ Failed to set ${varName} in ${deployment.name}:`, error.message);
      console.error('💡 You may need to set it manually in Convex Dashboard\n');
    }
  });
});

console.log('\n' + '='.repeat(60));
console.log('✅ Done!\n');

console.log('📋 Next steps:');
console.log('   1. Verify variables in Convex Dashboard:');
console.log('      • Dev: https://dashboard.convex.dev/d/enchanted-salamander-914');
console.log('      • Prod: https://dashboard.convex.dev/d/spotted-gerbil-236');
console.log('   2. Or check via CLI:');
console.log('      • Dev: bunx convex env list');
console.log('      • Prod: bunx convex env list --prod');
console.log('   3. Test webhook: bun run stripe:test-webhooks');
console.log('   4. Check Convex logs: bunx convex logs --history 20\n');

