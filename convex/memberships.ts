import { mutation, query, httpAction, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Get all membership plans
export const getMembershipPlans = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db
      .query("membershipPlans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();
    
    return plans.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// Get membership plan by type
export const getMembershipPlanByType = query({
  args: { membershipType: v.union(
    v.literal("18-month-minimum"),
    v.literal("12-month-minimum"),
    v.literal("no-lock-in"),
    v.literal("12-month-upfront")
  ) },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("membershipPlans")
      .withIndex("by_type", (q) => q.eq("type", args.membershipType))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    
    return plan;
  },
});

// Get membership by Stripe subscription ID
export const getMembershipBySubscriptionId = query({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();
    
    return membership;
  },
});

// Get membership by subscription ID
export const getMembershipBySubscription = query({
  args: { subscriptionId: v.string() },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_subscription", (q) => q.eq("stripeSubscriptionId", args.subscriptionId))
      .first();
    
    return membership;
  },
});

// Get membership by ID
export const getMembership = query({
  args: { id: v.id("memberships") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Upsert membership (create or update existing)
export const upsertMembership = mutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
    membershipType: v.union(
      v.literal("18-month-minimum"),
      v.literal("12-month-minimum"),
      v.literal("no-lock-in"),
      v.literal("12-month-upfront")
    ),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if a membership with this subscription ID already exists
    const existingBySubscription = await ctx.db
      .query("memberships")
      .withIndex("by_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();

    if (existingBySubscription) {
      // Update existing membership
      await ctx.db.patch(existingBySubscription._id, {
        membershipType: args.membershipType,
        status: "active",
        stripeCustomerId: args.stripeCustomerId,
        stripePriceId: args.stripePriceId,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: false,
        updatedAt: Date.now(),
      });
      
      // Convert referral if user was referred (only if status changed to active)
      const user = await ctx.db.get(args.userId);
      if (user && (user.referredBy || user.referralCodeUsed)) {
        await ctx.scheduler.runAfter(0, api.referrals.convertReferral, {
          refereeClerkId: args.clerkId,
        });
      }
      
      return existingBySubscription._id;
    }

    // Cancel any existing active memberships for this user
    const existingMemberships = await ctx.db
      .query("memberships")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    for (const membership of existingMemberships) {
      await ctx.db.patch(membership._id, {
        status: "cancelled",
        updatedAt: Date.now(),
      });
    }

    // Create new membership
    const membershipId = await ctx.db.insert("memberships", {
      userId: args.userId,
      clerkId: args.clerkId,
      membershipType: args.membershipType,
      status: "active",
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Convert referral if user was referred
    const user = await ctx.db.get(args.userId);
    if (user && (user.referredBy || user.referralCodeUsed)) {
      await ctx.scheduler.runAfter(0, api.referrals.convertReferral, {
        refereeClerkId: args.clerkId,
      });
    }

    return membershipId;
  },
});

// Get all memberships for admin
export const getAllMemberships = query({
  args: {},
  handler: async (ctx) => {
    const memberships = await ctx.db.query("memberships").order("desc").collect();
    
    // Enrich with user information
    const enrichedMemberships = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return {
          ...membership,
          userName: user?.name || "Unknown User",
          userEmail: user?.email || "Unknown Email",
        };
      })
    );
    
    return enrichedMemberships;
  },
});

// Get all user memberships (including historical)
export const getUserMembershipHistory = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .collect();
    
    return memberships;
  },
});

// Create a new membership
export const createMembership = mutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
    membershipType: v.union(
      v.literal("18-month-minimum"),
      v.literal("12-month-minimum"),
      v.literal("no-lock-in"),
      v.literal("12-month-upfront")
    ),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    // Cancel any existing active memberships
    const existingMemberships = await ctx.db
      .query("memberships")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    for (const membership of existingMemberships) {
      await ctx.db.patch(membership._id, {
        status: "cancelled",
        updatedAt: Date.now(),
      });
    }

    // Create new membership
    const membershipId = await ctx.db.insert("memberships", {
      userId: args.userId,
      clerkId: args.clerkId,
      membershipType: args.membershipType,
      status: "active",
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Convert referral if user was referred
    const user = await ctx.db.get(args.userId);
    if (user && (user.referredBy || user.referralCodeUsed)) {
      await ctx.scheduler.runAfter(0, api.referrals.convertReferral, {
        refereeClerkId: args.clerkId,
      });
    }

    return membershipId;
  },
});

// Update membership status
export const updateMembershipStatus = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("pending")
    ),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    console.log("🔍 Looking for membership with subscription ID:", args.stripeSubscriptionId);
    
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();

    if (!membership) {
      console.log("❌ Membership not found for subscription ID:", args.stripeSubscriptionId);
      
      // Let's also search for any memberships to debug
      const allMemberships = await ctx.db.query("memberships").collect();
      console.log("🔍 Total memberships in database:", allMemberships.length);
      
      if (allMemberships.length > 0) {
        console.log("🔍 Sample subscription IDs in database:", 
          allMemberships.slice(0, 3).map(m => m.stripeSubscriptionId)
        );
      }
      
      throw new Error(`Membership not found for subscription ID: ${args.stripeSubscriptionId}`);
    }

    console.log("✅ Found membership:", membership._id, "Current status:", membership.status);

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.currentPeriodStart !== undefined) {
      updates.currentPeriodStart = args.currentPeriodStart;
    }
    if (args.currentPeriodEnd !== undefined) {
      updates.currentPeriodEnd = args.currentPeriodEnd;
    }
    if (args.cancelAtPeriodEnd !== undefined) {
      updates.cancelAtPeriodEnd = args.cancelAtPeriodEnd;
    }

    await ctx.db.patch(membership._id, updates);
    return membership._id;
  },
});

// Clean up duplicate memberships for a user
export const cleanupDuplicateMemberships = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const allMemberships = await ctx.db
      .query("memberships")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    // Keep only the most recent active membership, cancel the rest
    const activeMemberships = allMemberships.filter(m => m.status === "active");
    
    if (activeMemberships.length > 1) {
      // Sort by creation date, keep the newest
      activeMemberships.sort((a, b) => b.createdAt - a.createdAt);
      
      // Cancel all but the newest
      for (let i = 1; i < activeMemberships.length; i++) {
        await ctx.db.patch(activeMemberships[i]._id, {
          status: "cancelled",
          updatedAt: Date.now(),
        });
      }
      
      return `Cleaned up ${activeMemberships.length - 1} duplicate memberships`;
    }
    
    return "No duplicates found";
  },
});

// Fix all users with duplicate memberships
export const fixAllDuplicateMemberships = mutation({
  args: {},
  handler: async (ctx) => {
    const allMemberships = await ctx.db.query("memberships").collect();
    const userGroups = new Map<string, any[]>();
    
    // Group memberships by clerkId
    for (const membership of allMemberships) {
      const existing = userGroups.get(membership.clerkId) || [];
      existing.push(membership);
      userGroups.set(membership.clerkId, existing);
    }
    
    let fixedUsers = 0;
    
    // Fix users with multiple active memberships
    for (const [clerkId, memberships] of userGroups) {
      const activeMemberships = memberships.filter(m => m.status === "active");
      
      if (activeMemberships.length > 1) {
        // Keep the newest, cancel the rest
        activeMemberships.sort((a, b) => b.createdAt - a.createdAt);
        
        for (let i = 1; i < activeMemberships.length; i++) {
          await ctx.db.patch(activeMemberships[i]._id, {
            status: "cancelled",
            updatedAt: Date.now(),
          });
        }
        
        fixedUsers++;
      }
    }
    
    return { fixedUsers, totalUsers: userGroups.size };
  },
});

// Cancel Stripe subscription (action)
export const cancelStripeSubscription = action({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; subscription?: any; error?: string; dbUpdate?: any }> => {
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        throw new Error("Missing STRIPE_SECRET_KEY environment variable. Set it in Convex dashboard.");
      }
      const stripe = require("stripe")(stripeSecretKey);
      
      // Cancel the subscription at period end
      const updatedSubscription = await stripe.subscriptions.update(args.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      
      console.log("✅ Stripe subscription cancelled at period end:", args.stripeSubscriptionId);
      console.log("🔄 Subscription status:", updatedSubscription.status);
      console.log("🚫 Cancel at period end:", updatedSubscription.cancel_at_period_end);
      
      // The webhook should automatically update our database when this change occurs
      // But let's also update it directly to ensure consistency
      try {
        const updateResult = await ctx.runMutation(api.memberships.updateMembershipStatus, {
          stripeSubscriptionId: args.stripeSubscriptionId,
          status: "active", // Keep as active until period ends
          cancelAtPeriodEnd: true,
        });
        
        console.log("🔄 Direct database update result:", updateResult);
        return { success: true, subscription: updatedSubscription, dbUpdate: updateResult };
      } catch (dbError) {
        console.log("⚠️ Database update failed, but Stripe cancellation succeeded:", dbError);
        return { success: true, subscription: updatedSubscription, dbUpdate: null };
      }
      
    } catch (error: any) {
      console.error("❌ Error cancelling Stripe subscription:", error);
      return { success: false, error: error?.message || "Unknown error" };
    }
  },
});

// Cancel membership
export const cancelMembership = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    console.log("🔍 Looking for active membership for user:", args.clerkId);
    
    // First, let's see all memberships for this user
    const allUserMemberships = await ctx.db
      .query("memberships")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();
    
    console.log("📊 All memberships for user:", allUserMemberships.map(m => ({
      id: m._id,
      status: m.status,
      type: m.membershipType,
      cancelAtPeriodEnd: m.cancelAtPeriodEnd,
      subscriptionId: m.stripeSubscriptionId
    })));
    
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      console.log("❌ No active membership found for user:", args.clerkId);
      throw new Error("No active membership found");
    }

    console.log("🚫 Cancelling membership for user:", args.clerkId);
    console.log("📋 Membership details:", {
      membershipId: membership._id,
      type: membership.membershipType,
      subscriptionId: membership.stripeSubscriptionId,
      currentStatus: membership.status,
      cancelAtPeriodEnd: membership.cancelAtPeriodEnd
    });

    // Update the membership immediately in the database
    console.log("🔄 Updating membership in database...");
    console.log("🔍 Before update - membership data:", {
      id: membership._id,
      status: membership.status,
      cancelAtPeriodEnd: membership.cancelAtPeriodEnd,
      updatedAt: membership.updatedAt
    });
    
    const patchResult = await ctx.db.patch(membership._id, {
      cancelAtPeriodEnd: true,
      updatedAt: Date.now(),
    });
    console.log("✅ Patch operation result:", patchResult);
    
    // Verify the update by reading the membership again
    const verifyMembership = await ctx.db.get(membership._id);
    console.log("🔍 After update - membership data:", {
      id: verifyMembership?._id,
      status: verifyMembership?.status,
      cancelAtPeriodEnd: verifyMembership?.cancelAtPeriodEnd,
      updatedAt: verifyMembership?.updatedAt
    });
    
    if (verifyMembership?.cancelAtPeriodEnd !== true) {
      console.error("❌ Database update failed! cancelAtPeriodEnd is still:", verifyMembership?.cancelAtPeriodEnd);
      throw new Error("Failed to update membership in database");
    }
    
    console.log("✅ Database successfully updated with cancelAtPeriodEnd: true");

    // Schedule Stripe cancellation if subscription ID exists
    if (membership.stripeSubscriptionId) {
      console.log("🔄 Scheduling Stripe subscription cancellation...");
      await ctx.scheduler.runAfter(0, api.memberships.cancelStripeSubscription, {
        stripeSubscriptionId: membership.stripeSubscriptionId,
      });
    } else {
      console.log("⚠️ No Stripe subscription found");
    }

    console.log("✅ Membership cancellation initiated successfully");
    
    // Return the updated membership
    const updatedMembership = await ctx.db.get(membership._id);
    return updatedMembership;
  },
});

// Seed membership plans
export const seedMembershipPlans = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if plans already exist
    const existingPlans = await ctx.db.query("membershipPlans").collect();
    if (existingPlans.length > 0) {
      return { message: "Membership plans already exist" };
    }

    const plans = [
      {
        name: "18 Month Minimum",
        description: "Best value with 18-month commitment",
        price: 14.95,
        currency: "AUD",
        type: "18-month-minimum" as const,
        stripePriceId: "price_1SRF1M4ghJnevp5XHk8AwEB0", // Derrimut 18-month plan
        stripeProductId: "prod_TO13HhWD4id9gk", // Derrimut 18-month product
        features: [
          "Access all Derrimut 24:7 gyms Australia wide",
          "24/7 access at selected locations",
          "Group fitness classes",
          "Personal trainers available",
          "Fully stocked supplement superstore"
        ],
        isActive: true,
        sortOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "12 Month Minimum",
        description: "12-month commitment plan",
        price: 17.95,
        currency: "AUD",
        type: "12-month-minimum" as const,
        stripePriceId: "price_1SRF1O4ghJnevp5XtcVKujOd", // Derrimut 12-month plan
        stripeProductId: "prod_TO13WeOKja1J3f", // Derrimut 12-month product
        features: [
          "Access all Derrimut 24:7 gyms Australia wide",
          "24/7 access at selected locations",
          "Group fitness classes",
          "Personal trainers available",
          "Fully stocked supplement superstore"
        ],
        isActive: true,
        sortOrder: 2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "No Lock-in Contract",
        description: "Ultimate flexibility with 30-day cancellation notice",
        price: 19.95,
        currency: "AUD",
        type: "no-lock-in" as const,
        stripePriceId: "price_1SRF1P4ghJnevp5X6W3ajo8O", // Derrimut no-lock-in plan
        stripeProductId: "prod_TO13CDZ0wbRcI2", // Derrimut no-lock-in product
        features: [
          "Access all Derrimut 24:7 gyms Australia wide",
          "24/7 access at selected locations",
          "Group fitness classes",
          "Personal trainers available",
          "Cancel anytime with 30-day notice",
          "Fully stocked supplement superstore"
        ],
        isActive: true,
        sortOrder: 3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "12 Month Upfront",
        description: "Best value - save on fortnightly fees",
        price: 749,
        currency: "AUD",
        type: "12-month-upfront" as const,
        stripePriceId: "price_1SRF1Q4ghJnevp5XK4w1yXVX", // Derrimut 12-month upfront plan
        stripeProductId: "prod_TO132agrJCpBrJ", // Derrimut 12-month upfront product
        features: [
          "Access all Derrimut 24:7 gyms Australia wide",
          "24/7 access at selected locations",
          "Group fitness classes",
          "Personal trainers available",
          "Save compared to fortnightly payments"
        ],
        isActive: true,
        sortOrder: 4,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ];

    for (const plan of plans) {
      await ctx.db.insert("membershipPlans", plan);
    }

    return { message: "Membership plans seeded successfully", count: plans.length };
  },
});

// Create membership from successful Stripe checkout session
export const createMembershipFromSession = mutation({
  args: {
    sessionId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable. Set it in Convex dashboard.");
    }
    const stripe = require("stripe")(stripeSecretKey);
    
    try {
      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(args.sessionId, {
        expand: ['subscription', 'subscription.items.data.price.product'],
      });

      if (session.payment_status !== 'paid') {
        throw new Error("Payment not completed");
      }

      if (!session.subscription) {
        throw new Error("No subscription found for this session");
      }

      const subscription = session.subscription;
      const priceId = subscription.items.data[0].price.id;
      const productId = subscription.items.data[0].price.product.id;

      // Determine membership type from metadata or product ID
      let membershipType: "18-month-minimum" | "12-month-minimum" | "no-lock-in" | "12-month-upfront" = "18-month-minimum";
      
      if (session.metadata?.membershipType) {
        membershipType = session.metadata.membershipType as any;
      } else {
        // Fallback to product ID mapping - Derrimut product IDs
        switch (productId) {
          case "prod_TO13HhWD4id9gk":
            membershipType = "18-month-minimum";
            break;
          case "prod_TO13WeOKja1J3f":
            membershipType = "12-month-minimum";
            break;
          case "prod_TO13CDZ0wbRcI2":
            membershipType = "no-lock-in";
            break;
          case "prod_TO132agrJCpBrJ":
            membershipType = "12-month-upfront";
            break;
          default:
            membershipType = "18-month-minimum";
        }
      }

      // Get user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      // Check if membership already exists
      const existingMembership = await ctx.db
        .query("memberships")
        .withIndex("by_subscription", (q) => q.eq("stripeSubscriptionId", subscription.id))
        .first();

      if (existingMembership) {
        return existingMembership;
      }

      // Cancel any existing active memberships
      const existingMemberships = await ctx.db
        .query("memberships")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      for (const membership of existingMemberships) {
        await ctx.db.patch(membership._id, { status: "cancelled" });
      }

      // Create new membership
      const membershipId = await ctx.db.insert("memberships", {
        userId: user._id,
        clerkId: args.clerkId,
        membershipType,
        status: "active",
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        currentPeriodStart: subscription.current_period_start * 1000,
        currentPeriodEnd: subscription.current_period_end * 1000,
        cancelAtPeriodEnd: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Convert referral if user was referred
      if (user.referredBy || user.referralCodeUsed) {
        await ctx.scheduler.runAfter(0, api.referrals.convertReferral, {
          refereeClerkId: args.clerkId,
        });
      }

      console.log("✅ Membership created from session:", membershipId);
      return await ctx.db.get(membershipId);

    } catch (error) {
      console.error("❌ Error creating membership from session:", error);
      throw new Error(`Failed to create membership: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

// Check and update expired memberships
export const checkExpiredMemberships = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find all active memberships that have expired
    const expiredMemberships = await ctx.db
      .query("memberships")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "active"),
          q.lt(q.field("currentPeriodEnd"), now)
        )
      )
      .collect();

    let updatedCount = 0;
    for (const membership of expiredMemberships) {
      await ctx.db.patch(membership._id, {
        status: "expired",
        updatedAt: now,
      });
      updatedCount++;
    }

    console.log(`🕐 Updated ${updatedCount} expired memberships`);
    return { updatedCount, expiredMemberships: expiredMemberships.length };
  },
});

// Update membership type and price (for tier changes)
export const updateMembershipType = mutation({
  args: {
    membershipId: v.id("memberships"),
    membershipType: v.string(),
    stripePriceId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.membershipId, {
      membershipType: args.membershipType,
      stripePriceId: args.stripePriceId,
      updatedAt: Date.now(),
    });
  },
});

// Fix membership periods using Stripe data
export const fixMembershipPeriods = mutation({
  args: { membershipId: v.id("memberships") },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable. Set it in Convex dashboard.");
    }
    const stripe = require("stripe")(stripeSecretKey);
    
    try {
      const membership = await ctx.db.get(args.membershipId);
      if (!membership) {
        throw new Error("Membership not found");
      }

      // Get subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(membership.stripeSubscriptionId);
      
      let currentPeriodStart = subscription.current_period_start;
      let currentPeriodEnd = subscription.current_period_end;
      
      // If still no periods, calculate them
      if (!currentPeriodStart || !currentPeriodEnd) {
        const now = Math.floor(Date.now() / 1000);
        currentPeriodStart = subscription.start_date || subscription.created || now;
        currentPeriodEnd = currentPeriodStart + (30 * 24 * 60 * 60); // 30 days
      }

      // Update the membership
      await ctx.db.patch(args.membershipId, {
        currentPeriodStart: currentPeriodStart * 1000,
        currentPeriodEnd: currentPeriodEnd * 1000,
        updatedAt: Date.now(),
      });

      console.log("✅ Fixed membership periods:", {
        membershipId: args.membershipId,
        periodStart: new Date(currentPeriodStart * 1000),
        periodEnd: new Date(currentPeriodEnd * 1000)
      });

      return await ctx.db.get(args.membershipId);
    } catch (error) {
      console.error("❌ Error fixing membership periods:", error);
      throw new Error(`Failed to fix periods: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

// Get membership with expiry check
export const getUserMembershipWithExpiryCheck = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Get the most recent membership regardless of status
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .first();

    if (!membership) return null;

    // Check if membership is expired but status is still active
    const now = Date.now();
    if (membership.status === "active" && membership.currentPeriodEnd < now) {
      // This will be handled by the checkExpiredMemberships mutation
      // For now, return it with a flag indicating it's expired
      return {
        ...membership,
        isExpired: true
      };
    }

    return {
      ...membership,
      isExpired: false
    };
  },
});

// Fix all memberships with invalid periods
export const fixAllMembershipPeriods = mutation({
  args: {},
  handler: async (ctx) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable. Set it in Convex dashboard.");
    }
    const stripe = require("stripe")(stripeSecretKey);
    
    try {
      // Find memberships with invalid periods (NaN or 0)
      const invalidMemberships = await ctx.db
        .query("memberships")
        .filter((q) =>
          q.or(
            q.eq(q.field("currentPeriodStart"), NaN),
            q.eq(q.field("currentPeriodEnd"), NaN),
            q.eq(q.field("currentPeriodStart"), 0),
            q.eq(q.field("currentPeriodEnd"), 0)
          )
        )
        .collect();

      let fixedCount = 0;
      
      for (const membership of invalidMemberships) {
        try {
          // Get subscription from Stripe
          const subscription = await stripe.subscriptions.retrieve(membership.stripeSubscriptionId);
          
          let currentPeriodStart = subscription.current_period_start;
          let currentPeriodEnd = subscription.current_period_end;
          
          // If still no periods, calculate them
          if (!currentPeriodStart || !currentPeriodEnd) {
            const now = Math.floor(Date.now() / 1000);
            currentPeriodStart = subscription.start_date || subscription.created || now;
            currentPeriodEnd = currentPeriodStart + (30 * 24 * 60 * 60); // 30 days
          }

          // Update the membership
          await ctx.db.patch(membership._id, {
            currentPeriodStart: currentPeriodStart * 1000,
            currentPeriodEnd: currentPeriodEnd * 1000,
            updatedAt: Date.now(),
          });

          fixedCount++;
          console.log(`✅ Fixed membership ${membership._id} periods`);
        } catch (error) {
          console.error(`❌ Failed to fix membership ${membership._id}:`, error);
        }
      }

      console.log(`🔧 Fixed ${fixedCount} out of ${invalidMemberships.length} memberships`);
      return { fixedCount, totalInvalid: invalidMemberships.length };
    } catch (error) {
      console.error("❌ Error fixing membership periods:", error);
      throw new Error(`Failed to fix periods: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});
