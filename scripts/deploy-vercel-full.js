#!/usr/bin/env node

/**
 * Complete Vercel deployment automation script
 * Handles everything that can be done via Vercel CLI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Complete Vercel Deployment Automation\n');
console.log('='.repeat(60));
console.log('');

// Check Vercel CLI
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Vercel CLI not found!');
  console.error('💡 Install: npm i -g vercel\n');
  process.exit(1);
}

// Check if logged in
try {
  const whoami = execSync('vercel whoami', { encoding: 'utf8' }).trim();
  console.log(`✅ Logged in as: ${whoami}\n`);
} catch (error) {
  console.error('❌ Not logged in to Vercel!');
  console.error('💡 Run: vercel login\n');
  process.exit(1);
}

// Check if project is linked
const vercelDir = path.join(process.cwd(), '.vercel');
if (!fs.existsSync(vercelDir)) {
  console.log('⚠️  Project not linked to Vercel');
  console.log('💡 Linking project...\n');
  try {
    execSync('vercel link --yes', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to link project');
    console.error('💡 Run manually: vercel link\n');
    process.exit(1);
  }
}

// Production environment variables
// NOTE: Clerk keys should be read from .env.local or environment variables
// These are defaults - scripts will read from .env.local if available
const productionEnv = {
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'YOUR_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY': process.env.CLERK_SECRET_KEY || 'YOUR_CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CONVEX_URL': 'https://spotted-gerbil-236.convex.cloud',
  'CONVEX_DEPLOYMENT': 'spotted-gerbil-236',
};

// Read all keys from .env.local (including Clerk and Stripe)
const envPath = path.join(__dirname, '..', '.env.local');
let stripeKeys = {};
let clerkKeys = {};

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
        } else if (key.includes('CLERK')) {
          clerkKeys[key.trim()] = value.trim();
        }
      }
    }
  });
}

// Use values from .env.local if available, otherwise use defaults
const allVars = {
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': clerkKeys.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || productionEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  'CLERK_SECRET_KEY': clerkKeys.CLERK_SECRET_KEY || productionEnv.CLERK_SECRET_KEY,
  'NEXT_PUBLIC_CONVEX_URL': productionEnv.NEXT_PUBLIC_CONVEX_URL,
  'CONVEX_DEPLOYMENT': productionEnv.CONVEX_DEPLOYMENT,
  ...stripeKeys
};

console.log('📋 Setting Environment Variables in Vercel...\n');

let successCount = 0;
let failCount = 0;

for (const [key, value] of Object.entries(allVars)) {
  try {
    console.log(`Setting ${key}...`);
    
    // Check if variable already exists
    try {
      const existing = execSync(`vercel env ls ${key} production`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      if (existing.includes(key)) {
        console.log(`   ⚠️  Already exists, skipping...`);
        successCount++;
        continue;
      }
    } catch (e) {
      // Variable doesn't exist, proceed to add it
    }
    
    // Add variable
    execSync(`echo "${value}" | vercel env add ${key} production`, {
      stdio: 'pipe',
    });
    
    console.log(`   ✅ Set ${key}\n`);
    successCount++;
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}\n`);
    failCount++;
  }
}

console.log('='.repeat(60));
console.log(`✅ Set ${successCount} variables`);
if (failCount > 0) {
  console.log(`⚠️  Failed to set ${failCount} variables`);
}
console.log('');

// Configure domain
const domain = 'derrimut.aliaslabs.ai';
console.log(`🌐 Configuring Domain: ${domain}\n`);

try {
  // Check if domain already exists
  const domains = execSync('vercel domains ls', { encoding: 'utf8' });
  if (domains.includes(domain)) {
    console.log(`✅ Domain ${domain} already configured\n`);
  } else {
    console.log(`Adding domain ${domain}...`);
    execSync(`vercel domains add ${domain}`, { stdio: 'inherit' });
    console.log(`✅ Domain ${domain} added\n`);
  }
} catch (error) {
  console.error(`⚠️  Domain configuration may need manual setup`);
  console.error(`   Error: ${error.message}\n`);
}

// Deploy to production
console.log('🚀 Deploying to Production...\n');
console.log('='.repeat(60));
console.log('');

try {
  execSync('vercel --prod --yes', { stdio: 'inherit' });
  console.log('\n✅ Deployment successful!\n');
} catch (error) {
  console.error('\n❌ Deployment failed');
  console.error('💡 Check logs above for details\n');
  process.exit(1);
}

console.log('='.repeat(60));
console.log('\n✅ Vercel Deployment Complete!\n');

console.log('📋 Next Steps (Manual - Must be done in Clerk Dashboard):\n');
console.log('1. Go to Clerk Dashboard: https://dashboard.clerk.com');
console.log('2. Select app: derrimut (production)');
console.log('3. Navigate to: Settings → Domains');
console.log('4. In "Allowed Origins", add:');
console.log('   • derrimut.aliaslabs.ai');
console.log('   • https://derrimut.aliaslabs.ai');
console.log('5. In "Redirect URLs", add:');
console.log('   • https://derrimut.aliaslabs.ai/*');
console.log('   • https://derrimut.aliaslabs.ai/sign-in');
console.log('   • https://derrimut.aliaslabs.ai/sign-up');
console.log('6. If custom domain is configured, remove it or set up DNS');
console.log('\n💡 After updating Clerk, your site should work!\n');

console.log('🔗 Production URL: https://derrimut.aliaslabs.ai\n');

