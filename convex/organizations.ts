import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Seed all Derrimut locations into the organizations table
 * Note: These will have placeholder Clerk organization IDs that can be updated later
 * when actual Clerk organizations are created for each location.
 */
export const seedDerrimutLocations = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Get or create a system admin user for seeding
    // In production, each location should have its own admin
    let systemAdmin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", "system"))
      .first();
    
    if (!systemAdmin) {
      // Create a placeholder system admin user
      const adminId = await ctx.db.insert("users", {
        name: "System Admin",
        email: "admin@derrimut247.com.au",
        clerkId: "system",
        role: "admin",
        accountType: "organization",
        createdAt: now,
        updatedAt: now,
      });
      const createdAdmin = await ctx.db.get(adminId);
      if (!createdAdmin) {
        throw new Error("Failed to create system admin user");
      }
      systemAdmin = createdAdmin;
    }

    // All Derrimut locations with full details
    const locations = [
      // Victoria Locations
      {
        id: "derrimut-airport-west",
        name: "Derrimut 24:7 Gym - Airport West",
        slug: "airport-west",
        address: {
          street: "8 Louis Street",
          city: "Airport West",
          state: "VIC",
          postcode: "3042",
          country: "Australia",
        },
        coordinates: { lat: -37.7281, lng: 144.8847 },
        phone: "+61 3 9338 7375",
        email: "airportwest@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store"],
        status: "active" as const,
      },
      {
        id: "derrimut-ballarat",
        name: "Derrimut 24:7 Gym - Ballarat",
        slug: "ballarat",
        address: {
          street: "25-51 Learmonth Road",
          city: "Ballarat",
          state: "VIC",
          postcode: "3355",
          country: "Australia",
        },
        coordinates: { lat: -37.5622, lng: 143.8503 },
        phone: "+61 3 5338 2186",
        email: "ballarat@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store"],
        status: "active" as const,
      },
      {
        id: "derrimut-braybrook",
        name: "Derrimut 24:7 Gym - Braybrook",
        slug: "braybrook",
        address: {
          street: "227 Ballarat Road",
          city: "Braybrook",
          state: "VIC",
          postcode: "3019",
          country: "Australia",
        },
        coordinates: { lat: -37.7972, lng: 144.8564 },
        phone: "+61 3 9318 4296",
        email: "braybrook@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store"],
        status: "active" as const,
      },
      {
        id: "derrimut-caroline-springs",
        name: "Derrimut 24:7 Gym - Caroline Springs",
        slug: "caroline-springs",
        address: {
          street: "21-25 Panamax Drive",
          city: "Ravenhall",
          state: "VIC",
          postcode: "3023",
          country: "Australia",
        },
        coordinates: { lat: -37.7500, lng: 144.7500 },
        phone: "+61 3 8348 5288",
        email: "carolinesprings@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store", "reformer_pilates"],
        status: "active" as const,
      },
      {
        id: "derrimut-meadow-heights",
        name: "Derrimut 24:7 Gym - Meadow Heights",
        slug: "meadow-heights",
        address: {
          street: "1530 Pascoe Vale Rd",
          city: "Meadow Heights",
          state: "VIC",
          postcode: "3048",
          country: "Australia",
        },
        coordinates: { lat: -37.6500, lng: 144.9167 },
        phone: "+61 3 9303 7688",
        email: "coolaroo@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store", "reformer_pilates"],
        status: "active" as const,
      },
      {
        id: "derrimut-derrimut",
        name: "Derrimut 24:7 Gym - Derrimut",
        slug: "derrimut",
        address: {
          street: "2 Makland Dr",
          city: "Derrimut",
          state: "VIC",
          postcode: "3030",
          country: "Australia",
        },
        coordinates: { lat: -37.8167, lng: 144.7667 },
        phone: "+61 3 8358 4356",
        email: "derrimut@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store", "ladies_only"],
        status: "active" as const,
      },
      {
        id: "derrimut-frankston",
        name: "Derrimut 24:7 Gym - Frankston",
        slug: "frankston",
        address: {
          street: "40 Dandenong Rd W",
          city: "Frankston",
          state: "VIC",
          postcode: "3199",
          country: "Australia",
        },
        coordinates: { lat: -38.1442, lng: 145.1236 },
        phone: "+61 3 9776 3878",
        email: "frankston@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store"],
        status: "active" as const,
      },
      {
        id: "derrimut-corio",
        name: "Derrimut 24:7 Gym - Corio",
        slug: "corio",
        address: {
          street: "500-510 Princes Highway",
          city: "Corio",
          state: "VIC",
          postcode: "3214",
          country: "Australia",
        },
        coordinates: { lat: -38.0667, lng: 144.3667 },
        phone: "+61 3 5275 1414",
        email: "geelong@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store", "reformer_pilates"],
        status: "active" as const,
      },
      {
        id: "derrimut-melton",
        name: "Derrimut 24:7 Gym - Melton",
        slug: "melton",
        address: {
          street: "41-43 McKenzie St",
          city: "Melton",
          state: "VIC",
          postcode: "3337",
          country: "Australia",
        },
        coordinates: { lat: -37.6833, lng: 144.5833 },
        phone: "+61 3 9746 6685",
        email: "melton@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store"],
        status: "active" as const,
      },
      {
        id: "derrimut-newcomb",
        name: "Derrimut 24:7 Gym - Newcomb",
        slug: "newcomb",
        address: {
          street: "3/151 Bellarine Hwy",
          city: "Newcomb",
          state: "VIC",
          postcode: "3224",
          country: "Australia",
        },
        coordinates: { lat: -38.1667, lng: 144.3833 },
        phone: "+61 3 5248 1060",
        email: "newcomb@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store", "sauna", "ladies_only", "boxing"],
        status: "active" as const,
      },
      {
        id: "derrimut-oakleigh-east",
        name: "Derrimut 24:7 Gym - Oakleigh East",
        slug: "oakleigh-east",
        address: {
          street: "1686 Dandenong Rd",
          city: "Oakleigh East",
          state: "VIC",
          postcode: "3166",
          country: "Australia",
        },
        coordinates: { lat: -37.9000, lng: 145.1167 },
        phone: "+61 3 9562 9410",
        email: "oakleigh@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store", "reformer_pilates"],
        status: "active" as const,
      },
      {
        id: "derrimut-pakenham",
        name: "Derrimut 24:7 Gym - Pakenham",
        slug: "pakenham",
        address: {
          street: "8/825 Princes Highway",
          city: "Pakenham",
          state: "VIC",
          postcode: "3810",
          country: "Australia",
        },
        coordinates: { lat: -38.0833, lng: 145.4833 },
        phone: "+61 3 5943 0350",
        email: "pakenham@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store"],
        status: "active" as const,
      },
      {
        id: "derrimut-port-melbourne",
        name: "Derrimut 24:7 Gym - Port Melbourne",
        slug: "port-melbourne",
        address: {
          street: "391 Plummer St",
          city: "Port Melbourne",
          state: "VIC",
          postcode: "3207",
          country: "Australia",
        },
        coordinates: { lat: -37.8333, lng: 144.9333 },
        phone: "+61 3 8613 4000",
        email: "portmelbourne@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store", "reformer_pilates", "sauna", "basketball_court", "ladies_only", "nutrition_bar", "business_hub"],
        status: "active" as const,
      },
      {
        id: "derrimut-shepparton",
        name: "Derrimut 24:7 Gym - Shepparton",
        slug: "shepparton",
        address: {
          street: "Shop 4, 290 Benalla Road",
          city: "Shepparton",
          state: "VIC",
          postcode: "3630",
          country: "Australia",
        },
        coordinates: { lat: -36.3833, lng: 145.4000 },
        phone: "+61 3 5831 3089",
        email: "shepparton@derrimut247.com.au",
        is24Hours: false, // Reduced hours
        features: ["group_fitness", "personal_trainer", "supplement_store"],
        status: "active" as const,
      },
      {
        id: "derrimut-thomastown",
        name: "Derrimut 24:7 Gym - Thomastown",
        slug: "thomastown",
        address: {
          street: "187-205 Settlement Rd",
          city: "Thomastown",
          state: "VIC",
          postcode: "3074",
          country: "Australia",
        },
        coordinates: { lat: -37.6833, lng: 145.0167 },
        phone: "+61 3 9464 0800",
        email: "thomastown@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store", "reformer_pilates"],
        status: "active" as const,
      },
      // South Australia Locations
      {
        id: "derrimut-angle-vale",
        name: "Derrimut 24:7 Gym - Angle Vale",
        slug: "angle-vale",
        address: {
          street: "Shop 11 & 12, 121-129 Heaslip Rd",
          city: "Angle Vale",
          state: "SA",
          postcode: "5117",
          country: "Australia",
        },
        coordinates: { lat: -34.6333, lng: 138.6500 },
        phone: "+61 8 8284 7126",
        email: "anglevale@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store"],
        status: "inactive" as const, // Closed due to unpaid rent
      },
      {
        id: "derrimut-elizabeth",
        name: "Derrimut 24:7 Gym - Elizabeth",
        slug: "elizabeth",
        address: {
          street: "180 Phillip Highway",
          city: "Elizabeth South",
          state: "SA",
          postcode: "5112",
          country: "Australia",
        },
        coordinates: { lat: -34.7333, lng: 138.6667 },
        phone: "+61 8 8369 3049",
        email: "elizabeth@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store"],
        status: "active" as const,
      },
      {
        id: "derrimut-gepps-cross",
        name: "Derrimut 24:7 Gym - Gepps Cross",
        slug: "gepps-cross",
        address: {
          street: "750 Main North Rd",
          city: "Gepps Cross",
          state: "SA",
          postcode: "5094",
          country: "Australia",
        },
        coordinates: { lat: -34.8333, lng: 138.6000 },
        phone: "+61 8 8260 2470",
        email: "geppscross@derrimut247.com.au",
        is24Hours: true,
        features: ["group_fitness", "personal_trainer", "supplement_store"],
        status: "active" as const,
      },
    ];

    const results = [];
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const location of locations) {
      // Check if organization already exists (by slug)
      const existing = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", location.slug))
        .first();

      // Use placeholder Clerk org ID (will be updated when actual Clerk org is created)
      const clerkOrgId = `seed-${location.id}`;

      const organizationData = {
        clerkOrganizationId: existing?.clerkOrganizationId || clerkOrgId,
        name: location.name,
        slug: location.slug,
        type: "location" as const,
        status: location.status,
        address: location.address,
        coordinates: location.coordinates,
        phone: location.phone,
        email: location.email,
        is24Hours: location.is24Hours,
        features: location.features,
        adminId: systemAdmin._id,
        adminClerkId: systemAdmin.clerkId,
        totalMembers: 0,
        totalStaff: 0,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        createdBy: systemAdmin._id,
      };

      if (existing) {
        // Update existing organization
        await ctx.db.patch(existing._id, organizationData);
        updated++;
        results.push({ action: "updated", name: location.name, id: existing._id });
      } else {
        // Create new organization
        const orgId = await ctx.db.insert("organizations", organizationData);
        created++;
        results.push({ action: "created", name: location.name, id: orgId });
      }
    }

    return {
      success: true,
      total: locations.length,
      created,
      updated,
      skipped,
      results,
      message: `Successfully seeded ${created} new locations and updated ${updated} existing locations.`,
    };
  },
});

// --- Mutations ---

export const createOrUpdateOrganization = mutation({
  args: {
    clerkOrganizationId: v.string(),
    name: v.string(),
    slug: v.string(),
    adminClerkId: v.string(),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      postcode: v.string(),
      country: v.string(),
    }),
    type: v.union(v.literal("location"), v.literal("franchise")),
    is24Hours: v.boolean(),
    features: v.array(v.string()),
    coordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    openingHours: v.optional(v.object({
      monday: v.optional(v.string()),
      tuesday: v.optional(v.string()),
      wednesday: v.optional(v.string()),
      thursday: v.optional(v.string()),
      friday: v.optional(v.string()),
      saturday: v.optional(v.string()),
      sunday: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrganizationId", args.clerkOrganizationId))
      .first();

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.adminClerkId))
      .first();

    if (!adminUser) {
      throw new Error("Admin user not found for organization creation/update.");
    }

    const orgData = {
      ...args,
      adminId: adminUser._id,
      totalMembers: existingOrg?.totalMembers ?? 0,
      totalStaff: existingOrg?.totalStaff ?? 0,
      status: existingOrg?.status ?? ("active" as const),
      updatedAt: Date.now(),
    };

    if (existingOrg) {
      await ctx.db.patch(existingOrg._id, orgData);
      return existingOrg._id;
    } else {
      const newOrgId = await ctx.db.insert("organizations", {
        ...orgData,
        createdAt: Date.now(),
        createdBy: adminUser._id,
      });

      // Update the admin user's account to link to this organization
      await ctx.db.patch(adminUser._id, {
        accountType: "organization",
        organizationId: newOrgId,
        organizationRole: "org_admin",
      });

      return newOrgId;
    }
  },
});

export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"))),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      postcode: v.string(),
      country: v.string(),
    })),
    coordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    openingHours: v.optional(v.object({
      monday: v.optional(v.string()),
      tuesday: v.optional(v.string()),
      wednesday: v.optional(v.string()),
      thursday: v.optional(v.string()),
      friday: v.optional(v.string()),
      saturday: v.optional(v.string()),
      sunday: v.optional(v.string()),
    })),
    is24Hours: v.optional(v.boolean()),
    features: v.optional(v.array(v.string())),
    totalMembers: v.optional(v.number()),
    totalStaff: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { organizationId, ...rest } = args;
    await ctx.db.patch(organizationId, { ...rest, updatedAt: Date.now() });
  },
});

export const addMemberToOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    userClerkId: v.string(),
    role: v.union(v.literal("org_admin"), v.literal("org_member")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userClerkId))
      .first();

    if (!user) {
      throw new Error("User not found.");
    }

    await ctx.db.patch(user._id, {
      organizationId: args.organizationId,
      organizationRole: args.role,
      accountType: "organization",
      updatedAt: Date.now(),
    });

    // Increment totalMembers count in organization
    const organization = await ctx.db.get(args.organizationId);
    if (organization) {
      await ctx.db.patch(args.organizationId, {
        totalMembers: (organization.totalMembers || 0) + 1,
        updatedAt: Date.now(),
      });
    }
  },
});

export const removeMemberFromOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    userClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userClerkId))
      .first();

    if (!user || user.organizationId !== args.organizationId) {
      throw new Error("User not found in this organization.");
    }

    await ctx.db.patch(user._id, {
      organizationId: undefined,
      organizationRole: undefined,
      accountType: "personal",
      updatedAt: Date.now(),
    });

    // Decrement totalMembers count in organization
    const organization = await ctx.db.get(args.organizationId);
    if (organization) {
      await ctx.db.patch(args.organizationId, {
        totalMembers: Math.max(0, (organization.totalMembers || 0) - 1),
        updatedAt: Date.now(),
      });
    }
  },
});

export const deleteOrganization = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Optionally, disassociate all members first
    const members = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    for (const member of members) {
      await ctx.db.patch(member._id, {
        organizationId: undefined,
        organizationRole: undefined,
        accountType: "personal",
        updatedAt: Date.now(),
      });
    }

    await ctx.db.delete(args.organizationId);
  },
});

// --- Queries ---

export const getOrganizationById = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

export const getOrganizationByClerkId = query({
  args: { clerkOrganizationId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrganizationId", args.clerkOrganizationId))
      .first();
  },
});

export const getOrganizationBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getAllOrganizations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("organizations").collect();
  },
});

export const getOrganizationsByState = query({
  args: { state: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_state", (q) => q.eq("address.state", args.state))
      .collect();
  },
});

export const getOrganizationMembers = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const getUserOrganization = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || !user.organizationId) {
      return null;
    }

    return await ctx.db.get(user.organizationId);
  },
});

export const isOrganizationAdmin = query({
  args: { userClerkId: v.string(), organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userClerkId))
      .first();

    return user?.organizationId === args.organizationId && user?.organizationRole === "org_admin";
  },
});
