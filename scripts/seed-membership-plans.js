#!/usr/bin/env node

/**
 * Script to seed membership plans in Convex
 * Uses Convex HTTP action to trigger the seedMembershipPlans mutation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌱 Seeding Membership Plans\n');
console.log('='.repeat(60));
console.log('');

// Check if Convex is configured
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'http://localhost:8187';

console.log('📋 This will create 4 Derrimut membership plans:');
console.log('  1. 18 Month Minimum - $14.95/month');
console.log('  2. 12 Month Minimum - $17.95/month');
console.log('  3. No Lock-in Contract - $19.95/month');
console.log('  4. 12 Month Upfront - $199/year');
console.log('');

console.log('🚀 Running seedMembershipPlans mutation...\n');

try {
  // Use Convex CLI to run the mutation
  // First, check if we can use convex run
  const result = execSync(
    'bunx convex run memberships:seedMembershipPlans',
    { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    }
  );
  
  console.log('\n✅ Membership plans seeded successfully!\n');
  console.log('📝 Next steps:');
  console.log('  1. Refresh the membership page');
  console.log('  2. You should see all 4 plans');
  console.log('  3. Test the subscription flow\n');
  
} catch (error) {
  console.error('\n❌ Failed to seed plans via CLI');
  console.error('\n💡 Alternative: Run via Convex Dashboard');
  console.error('  1. Go to: https://dashboard.convex.dev');
  console.error('  2. Select project: enchanted-salamander-914');
  console.error('  3. Navigate to: Functions → memberships');
  console.error('  4. Find: seedMembershipPlans');
  console.error('  5. Click "Run" button\n');
  
  console.error('Or create an HTTP endpoint to trigger it.\n');
  process.exit(1);
}

