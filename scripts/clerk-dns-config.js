#!/usr/bin/env node

/**
 * DNS Configuration Helper for Clerk Custom Domain
 * This script generates the DNS records you need to add at your DNS provider
 */

console.log('🔧 Clerk DNS Configuration Helper\n');
console.log('='.repeat(60));
console.log('');

const dnsRecords = [
  {
    name: 'clerk.derrimut',
    type: 'CNAME',
    value: 'frontend-api.clerk.services',
    purpose: 'Frontend API',
    domain: 'clerk.derrimut.aliaslabs.ai'
  },
  {
    name: 'accounts.derrimut',
    type: 'CNAME',
    value: 'accounts.clerk.services',
    purpose: 'Account Portal',
    domain: 'accounts.derrimut.aliaslabs.ai'
  },
  {
    name: 'clkmail.derrimut',
    type: 'CNAME',
    value: 'mail.8wln2bwryw6c.clerk.services',
    purpose: 'Email',
    domain: 'clkmail.derrimut.aliaslabs.ai'
  },
  {
    name: 'clk._domainkey.derrimut',
    type: 'CNAME',
    value: 'dkim1.8wln2bwryw6c.clerk.services',
    purpose: 'Email DKIM (Domain Key 1)',
    domain: 'clk._domainkey.derrimut.aliaslabs.ai'
  },
  {
    name: 'clk2._domainkey.derrimut',
    type: 'CNAME',
    value: 'dkim2.8wln2bwryw6c.clerk.services',
    purpose: 'Email DKIM (Domain Key 2)',
    domain: 'clk2._domainkey.derrimut.aliaslabs.ai'
  }
];

console.log('📋 DNS Records to Add at Your DNS Provider\n');
console.log('Go to your DNS provider (where aliaslabs.ai is hosted)');
console.log('and add these CNAME records:\n');

dnsRecords.forEach((record, index) => {
  console.log(`${index + 1}. ${record.purpose}`);
  console.log(`   Name/Host: ${record.name}`);
  console.log(`   Type: ${record.type}`);
  console.log(`   Value/Target: ${record.value}`);
  console.log(`   Full Domain: ${record.domain}`);
  console.log('');
});

console.log('='.repeat(60));
console.log('\n🚀 Quick Setup Instructions:\n');

console.log('1. Log in to your DNS provider (Cloudflare, Route53, etc.)');
console.log('2. Navigate to DNS management for: aliaslabs.ai');
console.log('3. Add each CNAME record listed above');
console.log('4. Wait 5-15 minutes for DNS propagation');
console.log('5. Return to Clerk Dashboard and click "Verify"');
console.log('');

console.log('💡 Common DNS Providers:\n');
console.log('• Cloudflare: https://dash.cloudflare.com');
console.log('• AWS Route53: https://console.aws.amazon.com/route53');
console.log('• Google Domains: https://domains.google.com');
console.log('• Namecheap: https://www.namecheap.com/myaccount/login');
console.log('');

console.log('📝 After adding DNS records:\n');
console.log('1. Wait 5-15 minutes');
console.log('2. Go back to Clerk Dashboard');
console.log('3. Click "Verify" next to each domain');
console.log('4. Once verified, your site will work!\n');

