#!/usr/bin/env node
/**
 * Create Derrimut Gym Membership Products using Stripe CLI
 * 
 * This version uses Stripe CLI directly (no API key needed)
 * 
 * Usage:
 *   node scripts/create-stripe-products-cli.js
 */

const { execSync } = require('child_process');

const DERRIUMT_PLANS = [
  {
    name: "18 Month Minimum",
    description: "Best value with 18-month commitment - Access all Derrimut 24:7 gyms Australia wide",
    price: 14.95,
    currency: "aud",
    interval: "fortnightly",
    type: "18-month-minimum",
  },
  {
    name: "12 Month Minimum",
    description: "12-month commitment plan - Access all Derrimut 24:7 gyms Australia wide",
    price: 17.95,
    currency: "aud",
    interval: "fortnightly",
    type: "12-month-minimum",
  },
  {
    name: "No Lock-in Contract",
    description: "Ultimate flexibility with 30-day cancellation notice",
    price: 19.95,
    currency: "aud",
    interval: "fortnightly",
    type: "no-lock-in",
  },
  {
    name: "12 Month Upfront",
    description: "Best value - save on fortnightly fees",
    price: 749,
    currency: "aud",
    interval: "one-time",
    type: "12-month-upfront",
  }
];

async function createProducts() {
  console.log('🏋️  Creating Derrimut Gym Membership Products via Stripe CLI...\n');

  // Check Stripe CLI
  try {
    execSync('stripe --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Error: Stripe CLI not found');
    console.log('💡 Please install Stripe CLI: https://stripe.com/docs/stripe-cli');
    process.exit(1);
  }

  const results = [];

  try {
    for (const plan of DERRIUMT_PLANS) {
      console.log(`📦 Creating product: ${plan.name}...`);
      
      // Create product via Stripe CLI
      const productCmd = `stripe products create --name "${plan.name}" --description "${plan.description}"`;
      const productOutput = execSync(productCmd, { encoding: 'utf8' });
      const product = JSON.parse(productOutput);
      
      console.log(`   ✅ Product created: ${product.id}`);

      // Create price
      let price;
      if (plan.interval === "one-time") {
        // One-time payment
        const priceCmd = `stripe prices create --product ${product.id} --unit-amount ${Math.round(plan.price * 100)} --currency ${plan.currency}`;
        const priceOutput = execSync(priceCmd, { encoding: 'utf8' });
        price = JSON.parse(priceOutput);
      } else {
        // Recurring subscription (fortnightly = every 2 weeks)
        const priceCmd = `stripe prices create --product ${product.id} --unit-amount ${Math.round(plan.price * 100)} --currency ${plan.currency} --recurring.interval week --recurring.interval-count 2`;
        const priceOutput = execSync(priceCmd, { encoding: 'utf8' });
        price = JSON.parse(priceOutput);
      }

      console.log(`   ✅ Price created: ${price.id}`);
      console.log(`   💰 Amount: $${plan.price} ${plan.currency.toUpperCase()} ${plan.interval === 'one-time' ? 'one-time' : `per ${plan.interval}`}\n`);

      results.push({
        type: plan.type,
        productId: product.id,
        priceId: price.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval
      });
    }

    // Output results
    console.log('\n✅ All products created successfully!\n');
    console.log('📋 Product & Price IDs:\n');
    
    results.forEach(result => {
      console.log(`// ${result.name}`);
      console.log(`prod_DERRIMUT_${result.type.toUpperCase().replace(/-/g, '_')} = "${result.productId}"`);
      console.log(`price_DERRIMUT_${result.type.toUpperCase().replace(/-/g, '_')} = "${result.priceId}"`);
      console.log('');
    });

    // Save to file
    const fs = require('fs');
    fs.writeFileSync(
      'stripe-products-created.json',
      JSON.stringify(results, null, 2)
    );
    console.log('✅ Product IDs saved to stripe-products-created.json\n');

    console.log('💡 Next steps:');
    console.log('1. Run: npm run stripe:update-ids');
    console.log('2. This will automatically update convex/memberships.ts with the new IDs\n');

  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    if (error.stdout) {
      console.error('Output:', error.stdout);
    }
    process.exit(1);
  }
}

createProducts();

