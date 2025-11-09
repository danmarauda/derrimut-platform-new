#!/usr/bin/env node

/**
 * Create Adrian Portelli demo superadmin account
 * Run with: node create-superadmin.js
 */

const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: NEXT_PUBLIC_CONVEX_URL not found in .env.local");
  process.exit(1);
}

console.log("🚀 Creating Adrian Portelli demo superadmin account...");
console.log(`📡 Connecting to: ${CONVEX_URL}`);

const client = new ConvexHttpClient(CONVEX_URL);

async function createSuperAdmin() {
  try {
    // Create demo superadmin account
    const result = await client.mutation("demo:createDemoSuperAdmin", {
      email: "aportelli@derrimut.com.au",
      name: "Adrian Portelli",
      password: "PortelliTakeover2025!" // Reference only, not stored
    });
    
    console.log("\n✅ SUCCESS!");
    console.log(result.message);
    console.log(`📧 Email: aportelli@derrimut.com.au`);
    console.log(`👤 Name: Adrian Portelli`);
    console.log(`🔑 Role: superadmin`);
    console.log(`🆔 Clerk ID: ${result.clerkId}`);
    
    if (result.warning) {
      console.log(`\n⚠️  ${result.warning}`);
    }
    
    console.log("\n🎯 Next Steps:");
    console.log("   1. Navigate to: http://localhost:3000/super-admin/dashboard");
    console.log("   2. Click 'Login' button");
    console.log("   3. Use Clerk credentials to sign in");
    console.log("\n💡 For demo, the dashboard will work with this demo account");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.log("\n🔍 Troubleshooting:");
    console.log("   - Ensure Convex dev server is running");
    console.log("   - Check that demo.ts is deployed to Convex");
    console.log("   - Verify NEXT_PUBLIC_CONVEX_URL is correct");
  } finally {
    client.close();
  }
}

createSuperAdmin();