#!/usr/bin/env node

/**
 * Setup Resend Email Service for Derrimut Platform
 * Configures Resend API keys in Vercel and Convex
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'inherit',
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('\n📧 Resend Email Setup for Derrimut Platform\n');
  console.log('This script will help you configure Resend email service.\n');

  // Step 1: Get Resend API Key
  console.log('Step 1: Get your Resend API Key');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Go to https://resend.com and sign up/login');
  console.log('2. Navigate to API Keys section');
  console.log('3. Create a new API key');
  console.log('4. Copy the key (starts with "re_")\n');

  const apiKey = await question('Enter your Resend API Key: ');
  
  if (!apiKey || !apiKey.startsWith('re_')) {
    console.error('❌ Invalid API key. Resend API keys start with "re_"');
    process.exit(1);
  }

  // Step 2: Configure email addresses
  console.log('\nStep 2: Configure Email Addresses');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const fromEmail = await question('From Email (e.g., Derrimut 24:7 <noreply@derrimut247.com.au>): ') || 
    'Derrimut 24:7 <noreply@derrimut247.com.au>';
  
  const supportEmail = await question('Support Email (e.g., support@derrimut247.com.au): ') || 
    'support@derrimut247.com.au';

  // Step 3: Get production URL
  console.log('\nStep 3: Configure Production URL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const productionUrl = await question('Production URL (e.g., https://derrimut247.com.au): ') || 
    'https://derrimut247.com.au';

  // Step 4: Set Vercel environment variables
  console.log('\nStep 4: Setting Vercel Environment Variables');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const vercelEnvVars = [
    { name: 'RESEND_API_KEY', value: apiKey },
    { name: 'RESEND_FROM_EMAIL', value: fromEmail },
    { name: 'RESEND_SUPPORT_EMAIL', value: supportEmail },
  ];

  console.log('\nSetting variables for Production environment...\n');

  for (const envVar of vercelEnvVars) {
    console.log(`Setting ${envVar.name}...`);
    const result = execCommand(
      `echo "${envVar.value}" | vercel env add ${envVar.name} production`,
      { stdio: 'pipe' }
    );
    
    if (result.success) {
      console.log(`✅ ${envVar.name} set successfully`);
    } else {
      console.log(`⚠️  ${envVar.name} - You may need to set this manually in Vercel dashboard`);
    }
  }

  // Also set for Preview and Development
  console.log('\nSetting variables for Preview and Development environments...\n');
  
  for (const envVar of vercelEnvVars) {
    for (const env of ['preview', 'development']) {
      const result = execCommand(
        `echo "${envVar.value}" | vercel env add ${envVar.name} ${env}`,
        { stdio: 'pipe' }
      );
      if (result.success) {
        console.log(`✅ ${envVar.name} set for ${env}`);
      }
    }
  }

  // Step 5: Set Convex environment variables
  console.log('\nStep 5: Setting Convex Environment Variables');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('You need to set these in Convex Dashboard manually:');
  console.log('1. Go to https://dashboard.convex.dev');
  console.log('2. Select your project');
  console.log('3. Go to Settings > Environment Variables');
  console.log('4. Add the following variables:\n');

  const convexEnvVars = [
    { name: 'RESEND_API_KEY', value: apiKey },
    { name: 'RESEND_FROM_EMAIL', value: fromEmail },
    { name: 'RESEND_SUPPORT_EMAIL', value: supportEmail },
    { name: 'NEXTJS_URL', value: productionUrl },
  ];

  convexEnvVars.forEach(envVar => {
    console.log(`  ${envVar.name}=${envVar.value}`);
  });

  // Step 6: Save to .env.local for local development
  console.log('\nStep 6: Saving to .env.local for Local Development');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const envLocalPath = path.join(__dirname, '..', '.env.local');
  let envContent = '';

  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
  }

  // Add or update Resend variables
  const envLines = envContent.split('\n');
  const newEnvLines = [];
  const existingKeys = new Set();

  // Keep existing lines, update Resend vars if they exist
  envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key] = trimmed.split('=');
      if (key && key.startsWith('RESEND_')) {
        existingKeys.add(key.trim());
        return; // Skip old Resend vars
      }
    }
    if (trimmed) {
      newEnvLines.push(line);
    }
  });

  // Add Resend variables
  newEnvLines.push('\n# Resend Email Configuration');
  vercelEnvVars.forEach(envVar => {
    newEnvLines.push(`${envVar.name}=${envVar.value}`);
  });

  fs.writeFileSync(envLocalPath, newEnvLines.join('\n') + '\n');
  console.log('✅ Saved to .env.local');

  // Step 7: Domain verification info
  console.log('\nStep 7: Domain Verification (Optional but Recommended)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('For production, verify your domain in Resend:');
  console.log('1. Go to https://resend.com/domains');
  console.log('2. Add domain: derrimut247.com.au');
  console.log('3. Add DNS records provided by Resend:');
  console.log('   - SPF Record (TXT)');
  console.log('   - DKIM Record (TXT)');
  console.log('   - DMARC Record (TXT)');
  console.log('4. Wait for verification (5-10 minutes)');
  console.log('\nNote: Until domain is verified, you can use:');
  console.log('  Derrimut 24:7 <onboarding@resend.dev>');

  // Summary
  console.log('\n✅ Setup Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nNext Steps:');
  console.log('1. ✅ Vercel environment variables set');
  console.log('2. ⚠️  Set Convex environment variables manually');
  console.log('3. ⚠️  Verify domain in Resend (optional)');
  console.log('4. 🧪 Test email sending by creating a booking or order');
  console.log('\nTo test locally, restart your dev server:');
  console.log('  bun run dev\n');

  rl.close();
}

main().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});


