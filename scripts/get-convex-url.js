#!/usr/bin/env node
/**
 * Get Convex Deployment URL
 * 
 * This script helps get your Convex deployment URL for webhook configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Finding Convex Deployment URL...\n');

// Check if Convex is initialized
const convexJsonPath = path.join(__dirname, '..', 'convex.json');
if (!fs.existsSync(convexJsonPath)) {
  console.log('⚠️  Convex not initialized yet.\n');
  console.log('📋 To initialize Convex:');
  console.log('   1. Run: npx convex dev');
  console.log('   2. This will create convex.json and deploy your functions');
  console.log('   3. The deployment URL will be shown in the output\n');
  process.exit(0);
}

try {
  // Try to get deployment info from Convex
  console.log('📡 Checking Convex deployment...\n');
  
  // Read convex.json
  const convexConfig = JSON.parse(fs.readFileSync(convexJsonPath, 'utf8'));
  const deploymentName = convexConfig.deployment;
  
  if (deploymentName) {
    const webhookUrl = `https://${deploymentName}.convex.site/stripe-webhook`;
    const publicUrl = `https://${deploymentName}.convex.site`;
    
    console.log('✅ Found Convex deployment!\n');
    console.log(`📍 Deployment Name: ${deploymentName}`);
    console.log(`🔗 Public URL: ${publicUrl}`);
    console.log(`🔗 Webhook URL: ${webhookUrl}\n`);
    
    // Check .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add NEXT_PUBLIC_CONVEX_URL
    if (envContent.includes('NEXT_PUBLIC_CONVEX_URL=')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONVEX_URL=.*/g,
        `NEXT_PUBLIC_CONVEX_URL=${publicUrl}`
      );
      console.log('✅ Updated NEXT_PUBLIC_CONVEX_URL in .env.local\n');
    } else {
      envContent += `\nNEXT_PUBLIC_CONVEX_URL=${publicUrl}\n`;
      console.log('✅ Added NEXT_PUBLIC_CONVEX_URL to .env.local\n');
    }
    
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    
    console.log('📋 Next steps:');
    console.log('   1. Configure Stripe webhook: npm run stripe:configure-webhooks');
    console.log('   2. Use this webhook URL:', webhookUrl);
    console.log('   3. Test webhooks: npm run stripe:test-webhooks\n');
    
  } else {
    console.log('⚠️  Deployment name not found in convex.json');
    console.log('💡 Run: npx convex dev to initialize deployment\n');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Try running: npx convex dev\n');
}

