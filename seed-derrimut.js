#!/usr/bin/env node

/**
 * Seed script to populate Convex database with Derrimut locations
 * Run with: node seed-derrimut.js
 */

const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: NEXT_PUBLIC_CONVEX_URL not found in .env.local");
  process.exit(1);
}

console.log("🚀 Seeding Derrimut Platform database...");
console.log(`📡 Connecting to: ${CONVEX_URL}`);

const client = new ConvexHttpClient(CONVEX_URL);

async function seed() {
  try {
    // Seed Derrimut locations
    console.log("\n📍 Seeding 18 Derrimut gym locations...");
    const locationResult = await client.mutation("organizations:seedDerrimutLocations", {});
    console.log("✅ Locations seeded:", locationResult);

    // Seed membership plans
    console.log("\n💳 Seeding membership plans...");
    const plansResult = await client.mutation("memberships:seedMembershipPlans", {});
    console.log("✅ Plans seeded:", plansResult);

    console.log("\n🎉 Database seeding complete!");
    console.log("\n📊 Summary:");
    console.log(`   - Locations: ${locationResult.created} created, ${locationResult.updated} updated`);
    console.log(`   - Membership Plans: 4 types available`);
    console.log("\n🔗 View data at: https://dashboard.convex.dev/d/enchanted-salamander-914");

  } catch (error) {
    console.error("\n❌ Seeding failed:", error.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

seed();
