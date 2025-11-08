#!/usr/bin/env node
/**
 * Test Stripe Connection
 * 
 * This script tests if Stripe CLI is working and can create products
 */

const { execSync } = require('child_process');

console.log('🧪 Testing Stripe CLI Connection...\n');

try {
  // Test Stripe CLI is working
  console.log('1. Checking Stripe CLI version...');
  const version = execSync('stripe --version', { encoding: 'utf8' });
  console.log(`   ✅ ${version.trim()}\n`);

  // Test creating a test product
  console.log('2. Testing product creation...');
  const testProduct = execSync(
    'stripe products create --name "Derrimut Test" --description "CLI Test" --json',
    { encoding: 'utf8' }
  );
  
  const product = JSON.parse(testProduct);
  console.log(`   ✅ Product created: ${product.id}`);
  console.log(`   ✅ Name: ${product.name}\n`);

  // Delete test product
  console.log('3. Cleaning up test product...');
  execSync(`stripe products delete ${product.id} --json`, { encoding: 'utf8' });
  console.log(`   ✅ Test product deleted\n`);

  console.log('✅ Stripe CLI is working correctly!');
  console.log('\n💡 Next steps:');
  console.log('   1. Create .env.local file with:');
  console.log('      STRIPE_SECRET_KEY=sk_test_...');
  console.log('      NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.site');
  console.log('   2. Get your Stripe secret key from: https://dashboard.stripe.com/apikeys');
  console.log('   3. Run: npm run stripe:create-products\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Make sure:');
  console.log('   1. Stripe CLI is installed: stripe --version');
  console.log('   2. You are logged in: stripe login');
  console.log('   3. You have API access\n');
}

