#!/usr/bin/env node

/**
 * Automatically add Clerk DNS records via Vercel CLI
 * Since aliaslabs.ai is hosted on Vercel, we can use Vercel CLI!
 */

const { execSync } = require('child_process');

console.log('🔧 Adding Clerk DNS Records via Vercel CLI\n');
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

const domain = 'aliaslabs.ai';

const dnsRecords = [
  {
    name: 'clerk.derrimut',
    type: 'CNAME',
    value: 'frontend-api.clerk.services',
    purpose: 'Frontend API'
  },
  {
    name: 'accounts.derrimut',
    type: 'CNAME',
    value: 'accounts.clerk.services',
    purpose: 'Account Portal (fixes the error!)'
  },
  {
    name: 'clkmail.derrimut',
    type: 'CNAME',
    value: 'mail.8wln2bwryw6c.clerk.services',
    purpose: 'Email'
  },
  {
    name: 'clk._domainkey.derrimut',
    type: 'CNAME',
    value: 'dkim1.8wln2bwryw6c.clerk.services',
    purpose: 'Email DKIM Key 1'
  },
  {
    name: 'clk2._domainkey.derrimut',
    type: 'CNAME',
    value: 'dkim2.8wln2bwryw6c.clerk.services',
    purpose: 'Email DKIM Key 2'
  }
];

console.log(`📋 Adding DNS records for domain: ${domain}\n`);

let successCount = 0;
let failCount = 0;

for (const record of dnsRecords) {
  try {
    console.log(`Adding ${record.purpose}...`);
    console.log(`  Name: ${record.name}`);
    console.log(`  Type: ${record.type}`);
    console.log(`  Value: ${record.value}`);
    
    // Vercel CLI syntax: vercel dns add <domain> <name> <type> <value>
    execSync(
      `vercel dns add ${domain} ${record.name} ${record.type} ${record.value}`,
      { stdio: 'inherit' }
    );
    
    console.log(`✅ Added ${record.purpose}\n`);
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to add ${record.purpose}`);
    console.error(`   Error: ${error.message}\n`);
    failCount++;
  }
}

console.log('='.repeat(60));
console.log(`✅ Successfully added ${successCount} DNS records`);
if (failCount > 0) {
  console.log(`⚠️  Failed to add ${failCount} records`);
}
console.log('');

if (successCount > 0) {
  console.log('📝 Next Steps:\n');
  console.log('1. Wait 5-15 minutes for DNS propagation');
  console.log('2. Go to Clerk Dashboard → Settings → Domains');
  console.log('3. Click "Verify" next to each domain');
  console.log('4. Once verified, your site will work!\n');
  
  console.log('💡 Check DNS propagation:');
  console.log(`   dig ${dnsRecords[0].name}.${domain} CNAME\n`);
}

