#!/usr/bin/env node

const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function debugCheck() {
  console.log("🔍 DETAILED DEBUG CHECK\n");
  
  // Check Adrian's full details
  console.log("1. Adrian Portelli Full Details:");
  const adrian = await client.query("debug:getFullUserDetails", {
    email: "aportelli@derrimut.com.au"
  });
  console.log(JSON.stringify(adrian, null, 2));
  console.log("");
  
  // Check PortelliInc organization
  console.log("2. PortelliInc Organization:");
  const org = await client.query("debug:getOrganizationBySlug", {
    slug: "portelliinc"
  });
  console.log(JSON.stringify(org, null, 2));
  console.log("");
  
  // Summary
  console.log("3. Summary:");
  if (adrian.accountType === "organization" && 
      adrian.organizationId && 
      adrian.organizationRole === "org_admin") {
    console.log("✅ Adrian is properly linked to organization");
  } else {
    console.log("❌ Adrian is NOT properly linked");
    console.log(`   accountType: ${adrian.accountType || 'MISSING'}`);
    console.log(`   organizationId: ${adrian.organizationId || 'MISSING'}`);
    console.log(`   organizationRole: ${adrian.organizationRole || 'MISSING'}`);
  }
  
  if (!org.error) {
    console.log("✅ PortelliInc organization exists");
    console.log(`   Organization ID: ${org._id}`);
    console.log(`   Admin ID: ${org.adminId}`);
    console.log(`   Match: ${org.adminId === adrian._id ? 'YES' : 'NO'}`);
  } else {
    console.log("❌ PortelliInc organization NOT found");
  }
}

debugCheck().catch(console.error);
