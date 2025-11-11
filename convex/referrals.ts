import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Generate a unique referral code
function generateReferralCode(name: string): string {
  // Take first 3 letters of name, uppercase, add random 4-digit number
  const namePart = name
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `${namePart}${randomPart}`;
}

// Get or create referral code for user
export const getOrCreateReferralCode = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // If user already has a referral code, return it
    if (user.referralCode) {
      return user.referralCode;
    }

    // Generate a unique referral code
    let referralCode = generateReferralCode(user.name);
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure uniqueness
    while (attempts < maxAttempts) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_referral_code", (q) => q.eq("referralCode", referralCode))
        .first();

      if (!existing) {
        break; // Code is unique
      }

      referralCode = generateReferralCode(user.name);
      attempts++;
    }

    // Update user with referral code
    await ctx.db.patch(user._id, {
      referralCode,
      updatedAt: Date.now(),
    });

    return referralCode;
  },
});

// Get user's referral code
export const getUserReferralCode = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return null;
    }

    // If no referral code exists, return null (frontend can call getOrCreateReferralCode)
    return user.referralCode || null;
  },
});

// Validate referral code
export const validateReferralCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", args.code))
      .first();

    if (!user) {
      return { valid: false, message: "Invalid referral code" };
    }

    return {
      valid: true,
      referrerName: user.name,
      referrerId: user._id,
    };
  },
});

// Track referral (when someone signs up with a code)
export const trackReferral = mutation({
  args: {
    refereeClerkId: v.string(),
    referralCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Find referrer by code
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", args.referralCode))
      .first();

    if (!referrer) {
      throw new Error("Invalid referral code");
    }

    // Find referee
    const referee = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.refereeClerkId))
      .first();

    if (!referee) {
      throw new Error("Referee not found");
    }

    // Prevent self-referral
    if (referrer._id === referee._id) {
      throw new Error("Cannot refer yourself");
    }

    // Check if referral already exists
    const existingReferral = await ctx.db
      .query("referrals")
      .withIndex("by_referee_clerk", (q) => q.eq("refereeClerkId", args.refereeClerkId))
      .first();

    if (existingReferral) {
      return existingReferral._id; // Already tracked
    }

    // Update referee's referredBy field
    await ctx.db.patch(referee._id, {
      referredBy: referrer._id,
      referralCodeUsed: args.referralCode,
      updatedAt: Date.now(),
    });

    // Create referral record
    const referralId = await ctx.db.insert("referrals", {
      referrerId: referrer._id,
      referrerClerkId: referrer.clerkId,
      refereeId: referee._id,
      refereeClerkId: referee.clerkId,
      referralCode: args.referralCode,
      status: "pending", // Will be converted when they sign up for membership
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return referralId;
  },
});

// Convert referral (when referee signs up for membership)
export const convertReferral = mutation({
  args: {
    refereeClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find referral
    const referral = await ctx.db
      .query("referrals")
      .withIndex("by_referee_clerk", (q) => q.eq("refereeClerkId", args.refereeClerkId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (!referral) {
      return null; // No referral to convert
    }

    // Get referee user
    const referee = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.refereeClerkId))
      .first();

    if (!referee) {
      throw new Error("Referee user not found");
    }

    // Update referral status
    await ctx.db.patch(referral._id, {
      status: "converted",
      conversionDate: Date.now(),
      updatedAt: Date.now(),
    });

    // Award rewards (can be customized)
    const REFERRER_REWARD_POINTS = 500; // Points for referrer
    const REFEREE_REWARD_POINTS = 500; // Points for referee

    // Award points to referrer
    await ctx.scheduler.runAfter(0, api.loyalty.addPointsWithExpiration, {
      clerkId: referral.referrerClerkId,
      points: REFERRER_REWARD_POINTS,
      source: "referral",
      description: `Referral conversion: ${referee.name || referee.email}`,
      relatedId: referral._id,
    });

    // Award points to referee
    await ctx.scheduler.runAfter(0, api.loyalty.addPointsWithExpiration, {
      clerkId: referral.refereeClerkId,
      points: REFEREE_REWARD_POINTS,
      source: "referral",
      description: `Referral signup bonus`,
      relatedId: referral._id,
    });

    // Create Stripe discount code for referee (50% off first month)
    await ctx.scheduler.runAfter(0, api.stripeDiscounts.createReferralDiscountCode, {
      referralCode: referral.referralCode,
      refereeEmail: referee.email,
    });

    return referral._id;
  },
});

// Get user's referral stats
export const getReferralStats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return null;
    }

    // Get all referrals made by this user
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer_clerk", (q) => q.eq("referrerClerkId", args.clerkId))
      .collect();

    const stats = {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter((r) => r.status === "pending").length,
      convertedReferrals: referrals.filter((r) => r.status === "converted").length,
      rewardedReferrals: referrals.filter((r) => r.status === "rewarded").length,
      referralCode: user.referralCode || null,
      referralLink: user.referralCode
        ? `${process.env.NEXTJS_URL || "https://derrimut.aliaslabs.ai"}/signup?ref=${user.referralCode}`
        : null,
    };

    return stats;
  },
});

// Get user's referral history
export const getReferralHistory = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer_clerk", (q) => q.eq("referrerClerkId", args.clerkId))
      .order("desc")
      .collect();

    // Enrich with referee names
    const enrichedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        const referee = await ctx.db.get(referral.refereeId);
        return {
          ...referral,
          refereeName: referee?.name || "Unknown",
          refereeEmail: referee?.email || "Unknown",
        };
      })
    );

    return enrichedReferrals;
  },
});

// Get referrals for admin dashboard
export const getAllReferrals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (currentUser?.role !== "admin" && currentUser?.role !== "superadmin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const referrals = await ctx.db.query("referrals").order("desc").collect();

    // Enrich with user names
    const enrichedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        const referrer = await ctx.db.get(referral.referrerId);
        const referee = await ctx.db.get(referral.refereeId);
        return {
          ...referral,
          referrerName: referrer?.name || "Unknown",
          referrerEmail: referrer?.email || "Unknown",
          refereeName: referee?.name || "Unknown",
          refereeEmail: referee?.email || "Unknown",
        };
      })
    );

    return enrichedReferrals;
  },
});

