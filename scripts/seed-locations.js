#!/usr/bin/env node

/**
 * Script to seed all Derrimut locations into the organizations table
 * 
 * Usage:
 *   bun run scripts/seed-locations.js
 *   bun run scripts/seed-locations.js --prod  (for production)
 */

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const isProd = args.includes('--prod');

console.log('🌍 Seeding Derrimut Locations\n');
console.log('='.repeat(60));
console.log('');

const deployment = isProd ? '--prod' : '';

try {
  console.log(`Running seedDerrimutLocations mutation${isProd ? ' (PROD)' : ' (DEV)'}...\n`);
  
  const result = execSync(
    `bunx convex run organizations:seedDerrimutLocations ${deployment}`,
    {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: path.join(__dirname, '..'),
    }
  );
  
  console.log(result);
  console.log('✅ Locations seeded successfully!\n');
  
  console.log('📋 Next Steps:');
  console.log('  1. Verify locations in Convex Dashboard');
  console.log(`     • ${isProd ? 'Prod' : 'Dev'}: https://dashboard.convex.dev/d/${isProd ? 'spotted-gerbil-236' : 'enchanted-salamander-914'}`);
  console.log('  2. Query locations: bunx convex run organizations:getAllOrganizations');
  console.log('  3. When Clerk organizations are created, update clerkOrganizationId');
  console.log('     using: bunx convex run organizations:updateOrganization');
  console.log('');
  
} catch (error) {
  console.error('❌ Failed to seed locations:');
  console.error(error.message);
  if (error.stdout) console.error('Output:', error.stdout);
  if (error.stderr) console.error('Error:', error.stderr);
  process.exit(1);
}

