#!/usr/bin/env node
/**
 * Update Product IDs in Code
 * 
 * This script reads stripe-products-created.json and updates convex/memberships.ts
 * with the actual Stripe product and price IDs.
 * 
 * Usage:
 *   node scripts/update-product-ids.js
 */

const fs = require('fs');
const path = require('path');

function updateProductIds() {
  console.log('🔄 Updating product IDs in code...\n');

  // Read the created products file
  const productsFile = path.join(__dirname, '..', 'stripe-products-created.json');
  
  if (!fs.existsSync(productsFile)) {
    console.error('❌ Error: stripe-products-created.json not found');
    console.log('💡 Please run: node scripts/create-stripe-products.js first');
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  
  // Read memberships.ts
  const membershipsFile = path.join(__dirname, '..', 'convex', 'memberships.ts');
  let content = fs.readFileSync(membershipsFile, 'utf8');

  // Map product types to placeholder names in code
  const placeholderMap = {
    '18-month-minimum': '18MONTH',
    '12-month-minimum': '12MONTH',
    'no-lock-in': 'NOLOCKIN',
    '12-month-upfront': 'UPFRONT'
  };

  // Update each product ID
  products.forEach(product => {
    const placeholderSuffix = placeholderMap[product.type];
    const productPlaceholder = `prod_DERRIMUT_${placeholderSuffix}`;
    const pricePlaceholder = `price_DERRIMUT_${placeholderSuffix}`;

    // Replace product ID
    content = content.replace(
      new RegExp(`stripeProductId: "${productPlaceholder}"`, 'g'),
      `stripeProductId: "${product.productId}"`
    );

    // Replace price ID
    content = content.replace(
      new RegExp(`stripePriceId: "${pricePlaceholder}"`, 'g'),
      `stripePriceId: "${product.priceId}"`
    );

    console.log(`✅ Updated ${product.name}:`);
    console.log(`   Product ID: ${product.productId}`);
    console.log(`   Price ID: ${product.priceId}\n`);
  });

  // Also update the switch statements in createMembershipFromSession
  products.forEach(product => {
    const placeholderSuffix = placeholderMap[product.type];
    const productPlaceholder = `prod_DERRIMUT_${placeholderSuffix}`;
    
    // Update switch case for product ID mapping
    const switchPattern = new RegExp(
      `case "${productPlaceholder}":`,
      'g'
    );
    
    if (switchPattern.test(content)) {
      content = content.replace(
        switchPattern,
        `case "${product.productId}":`
      );
      console.log(`✅ Updated switch case for ${product.name}`);
    }
  });

  // Write updated content
  fs.writeFileSync(membershipsFile, content, 'utf8');
  
  console.log('\n✅ Successfully updated convex/memberships.ts');
  console.log('💡 Review the changes and commit them.\n');
}

updateProductIds();

