/**
 * Demo functions for creating test accounts
 * DEVELOPMENT ONLY - Remove in production
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a demo superadmin account without Clerk authentication
 * FOR DEMO PURPOSES ONLY
 */
export const createDemoSuperAdmin = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(), // Not used, just for reference
  },
  handler: async (ctx, args) => {
    // Generate a fake Clerk ID for demo purposes
    const demoClerkId = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Check if user already exists with this email
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      // Update to superadmin
      await ctx.db.patch(existingUser._id, {
        role: "superadmin",
        updatedAt: Date.now(),
      });
      
      return {
        success: true,
        userId: existingUser._id,
        clerkId: existingUser.clerkId,
        message: `Updated existing user ${args.email} to superadmin`,
      };
    }

    // Create new demo superadmin
    const userId = await ctx.db.insert("users", {
      clerkId: demoClerkId,
      email: args.email,
      name: args.name,
      role: "superadmin",
      accountType: "personal",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      userId,
      clerkId: demoClerkId,
      message: `Created demo superadmin: ${args.email}`,
      warning: "This is a DEMO account. For production, use Clerk authentication.",
    };
  },
});

/**
 * List all users (for debugging)
 */
export const listAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    return users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      clerkId: user.clerkId,
      createdAt: user.createdAt,
    }));
  },
});

/**
 * Delete demo users (cleanup)
 */
export const deleteDemoUsers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const demoUsers = users.filter(u => u.clerkId.startsWith("demo_"));
    
    for (const user of demoUsers) {
      await ctx.db.delete(user._id);
    }
    
    return {
      deleted: demoUsers.length,
      message: `Deleted ${demoUsers.length} demo users`,
    };
  },
});

/**
 * Demo analytics queries that bypass Clerk authentication
 * FOR DEMO PURPOSES ONLY - Use regular analytics.ts queries in production
 */

export const getDemoAnalytics = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user exists and is superadmin
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user || user.role !== "superadmin") {
      throw new Error("Unauthorized: Demo superadmin access required");
    }

    // Get all the analytics data (same logic as analytics.ts but without Clerk auth)
    const organizations = await ctx.db.query("organizations").collect();
    const memberships = await ctx.db
      .query("memberships")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    const plans = await ctx.db.query("membershipPlans").collect();
    const allPlans = await ctx.db.query("plans").collect();

    const planMap = new Map(plans.map(p => [p.stripePriceId, p]));
    const totalRevenue = memberships.reduce((sum, m) => {
      const plan = planMap.get(m.stripePriceId);
      return sum + (plan?.price || 0);
    }, 0);

    const totalMembers = organizations.reduce((sum, org) => {
      return sum + (org.totalMembers || 0);
    }, 0);

    return {
      summary: {
        activeLocations: organizations.filter(org => org.status === 'active').length,
        totalRevenue,
        totalMembers,
        aiConsultations: allPlans.length,
        growthRate: 9.4,
        systemStatus: 'operational' as const,
      },
      hasAccess: true,
      demoAccount: true,
    };
  },
});

/**
 * Create PortelliInc Super Admin Organization
 * Sets Adrian Portelli as the owner/org_admin
 */
export const createPortelliIncOrganization = mutation({
  args: {
    superAdminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Get Adrian's user account
    const adrian = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.superAdminEmail))
      .first();
    
    if (!adrian || adrian.role !== "superadmin") {
      throw new Error("Superadmin account not found");
    }

    // Check if PortelliInc organization already exists
    const existingOrg = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("slug"), "portelliinc"))
      .first();

    if (existingOrg) {
      // Update Adrian's user record to link to existing organization
      await ctx.db.patch(adrian._id, {
        accountType: "organization",
        organizationId: existingOrg._id,
        organizationRole: "org_admin",
        updatedAt: Date.now(),
      });

      return {
        success: true,
        organizationId: existingOrg._id,
        message: "Adrian Portelli linked to existing PortelliInc organization as owner",
      };
    }

    // Create PortelliInc organization
    const orgId = await ctx.db.insert("organizations", {
      clerkOrganizationId: `demo_org_portelliinc_${Date.now()}`,
      name: "PortelliInc - Super Admin Organization",
      slug: "portelliinc",
      type: "franchise",
      status: "active",
      address: {
        street: "Corporate Headquarters",
        city: "Melbourne",
        state: "VIC",
        postcode: "3000",
        country: "Australia",
      },
      phone: "+61 3 9999 0000",
      email: "admin@portelliinc.com.au",
      is24Hours: true,
      features: ["super_admin", "multi_location_management", "analytics", "reporting"],
      adminId: adrian._id,
      adminClerkId: adrian.clerkId,
      totalMembers: 0,
      totalStaff: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: adrian._id,
    });

    // Update Adrian's user record to link to organization
    await ctx.db.patch(adrian._id, {
      accountType: "organization",
      organizationId: orgId,
      organizationRole: "org_admin",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      organizationId: orgId,
      organizationName: "PortelliInc - Super Admin Organization",
      owner: {
        name: adrian.name,
        email: adrian.email,
        role: "org_admin",
      },
      message: "PortelliInc organization created with Adrian Portelli as owner",
    };
  },
});