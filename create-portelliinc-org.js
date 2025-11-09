#!/usr/bin/env node

/**
 * Create PortelliInc Super Admin Organization
 * Sets Adrian Portelli as the owner
 * Run with: node create-portelliinc-org.js
 */

const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: NEXT_PUBLIC_CONVEX_URL not found in .env.local");
  process.exit(1);
}

console.log("🏢 Creating PortelliInc Super Admin Organization...");
console.log(`📡 Connecting to: ${CONVEX_URL}`);

const client = new ConvexHttpClient(CONVEX_URL);

async function createOrganization() {
  try {
    // Create PortelliInc organization with Adrian as owner
    const result = await client.mutation("demo:createPortelliIncOrganization", {
      superAdminEmail: "aportelli@derrimut.com.au"
    });
    
    console.log("\n✅ SUCCESS!");
    console.log(result.message);
    
    if (result.organizationName) {
      console.log(`\n🏢 Organization Details:`);
      console.log(`   Name: ${result.organizationName}`);
      console.log(`   ID: ${result.organizationId}`);
      console.log(`\n👤 Owner Details:`);
      console.log(`   Name: ${result.owner.name}`);
      console.log(`   Email: ${result.owner.email}`);
      console.log(`   Role: ${result.owner.role} (Organization Admin)`);
    }
    
    console.log("\n🎯 Organization Created:");
    console.log("   ✓ PortelliInc - Super Admin Organization");
    console.log("   ✓ Adrian Portelli set as owner");
    console.log("   ✓ Full org_admin permissions granted");
    console.log("   ✓ Multi-location management enabled");
    
    console.log("\n🚀 Next Steps:");
    console.log("   1. Visit: http://localhost:3000/demo-dashboard");
    console.log("   2. Adrian now has organization-level access");
    console.log("   3. Can manage all 18 Derrimut locations from PortelliInc HQ");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.log("\n🔍 Troubleshooting:");
    console.log("   - Ensure Convex dev server is running");
    console.log("   - Check that demo.ts changes are deployed");
    console.log("   - Verify Adrian's superadmin account exists");
    console.log("   - Run: node create-superadmin.js (if needed)");
    process.exit(1);
  }
}

createOrganization();
