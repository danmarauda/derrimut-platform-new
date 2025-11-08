#!/usr/bin/env node
/**
 * Create Derrimut Gym Membership Products in Stripe
 * 
 * This script creates all 4 Derrimut membership products and prices via Stripe CLI
 * 
 * Prerequisites:
 * 1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
 * 2. Login: stripe login
 * 3. Set STRIPE_SECRET_KEY in .env.local
 * 
 * Usage:
 *   node scripts/create-stripe-products.js
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const { execSync } = require('child_process');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const DERRIUMT_PLANS = [
  {
    name: "18 Month Minimum",
    description: "Best value with 18-month commitment - Access all Derrimut 24:7 gyms Australia wide",
    price: 14.95,
    currency: "aud",
    interval: "fortnightly", // Stripe uses "week" with interval_count: 2
    type: "18-month-minimum",
    features: [
      "Access all Derrimut 24:7 gyms Australia wide",
      "24/7 access at selected locations",
      "Group fitness classes",
      "Personal trainers available",
      "Fully stocked supplement superstore"
    ]
  },
  {
    name: "12 Month Minimum",
    description: "12-month commitment plan - Access all Derrimut 24:7 gyms Australia wide",
    price: 17.95,
    currency: "aud",
    interval: "fortnightly",
    type: "12-month-minimum",
    features: [
      "Access all Derrimut 24:7 gyms Australia wide",
      "24/7 access at selected locations",
      "Group fitness classes",
      "Personal trainers available",
      "Fully stocked supplement superstore"
    ]
  },
  {
    name: "No Lock-in Contract",
    description: "Ultimate flexibility with 30-day cancellation notice",
    price: 19.95,
    currency: "aud",
    interval: "fortnightly",
    type: "no-lock-in",
    features: [
      "Access all Derrimut 24:7 gyms Australia wide",
      "24/7 access at selected locations",
      "Group fitness classes",
      "Personal trainers available",
      "Cancel anytime with 30-day notice",
      "Fully stocked supplement superstore"
    ]
  },
  {
    name: "12 Month Upfront",
    description: "Best value - save on fortnightly fees",
    price: 749,
    currency: "aud",
    interval: "one-time",
    type: "12-month-upfront",
    features: [
      "Access all Derrimut 24:7 gyms Australia wide",
      "24/7 access at selected locations",
      "Group fitness classes",
      "Personal trainers available",
      "Save compared to fortnightly payments"
    ]
  }
];

async function createProducts() {
  console.log('🏋️  Creating Derrimut Gym Membership Products in Stripe...\n');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Error: STRIPE_SECRET_KEY not found in .env.local');
    console.log('💡 Please add STRIPE_SECRET_KEY to your .env.local file');
    process.exit(1);
  }

  const results = [];

  try {
    for (const plan of DERRIUMT_PLANS) {
      console.log(`📦 Creating product: ${plan.name}...`);
      
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          membership_type: plan.type,
          features: plan.features.join('|')
        }
      });

      console.log(`   ✅ Product created: ${product.id}`);

      // Create price
      let price;
      if (plan.interval === "one-time") {
        // One-time payment
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(plan.price * 100), // Convert to cents
          currency: plan.currency,
        });
      } else {
        // Recurring subscription (fortnightly = every 2 weeks)
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(plan.price * 100), // Convert to cents
          currency: plan.currency,
          recurring: {
            interval: 'week',
            interval_count: 2, // Every 2 weeks = fortnightly
          },
        });
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
    console.log('Copy these IDs and update convex/memberships.ts:\n');
    
    results.forEach(result => {
      console.log(`// ${result.name}`);
      console.log(`prod_DERRIMUT_${result.type.toUpperCase().replace(/-/g, '_')} = "${result.productId}"`);
      console.log(`price_DERRIMUT_${result.type.toUpperCase().replace(/-/g, '_')} = "${result.priceId}"`);
      console.log('');
    });

    // Generate update script
    console.log('\n💡 Next steps:');
    console.log('1. Run: node scripts/update-product-ids.js');
    console.log('2. This will automatically update convex/memberships.ts with the new IDs');
    console.log('\nOr manually update convex/memberships.ts with the IDs above.\n');

    // Save to file for the update script
    const fs = require('fs');
    fs.writeFileSync(
      'stripe-products-created.json',
      JSON.stringify(results, null, 2)
    );
    console.log('✅ Product IDs saved to stripe-products-created.json\n');

  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 Make sure your STRIPE_SECRET_KEY is correct in .env.local');
    }
    process.exit(1);
  }
}

createProducts();

