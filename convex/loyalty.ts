import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get or create loyalty points account for user
async function getOrCreateLoyaltyAccount(ctx: any, userId: string, clerkId: string) {
  let loyaltyAccount = await ctx.db
    .query("loyaltyPoints")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  if (!loyaltyAccount) {
    const loyaltyId = await ctx.db.insert("loyaltyPoints", {
      userId: userId as any,
      clerkId,
      points: 0,
      totalEarned: 0,
      totalRedeemed: 0,
      lastUpdated: Date.now(),
    });
    loyaltyAccount = await ctx.db.get(loyaltyId);
  }

  return loyaltyAccount;
}

// Add points to user account
export const addPoints = mutation({
  args: {
    clerkId: v.string(),
    points: v.number(),
    source: v.union(
      v.literal("check_in"),
      v.literal("referral"),
      v.literal("purchase"),
      v.literal("challenge"),
      v.literal("achievement"),
      v.literal("redemption"),
      v.literal("admin_adjustment")
    ),
    description: v.string(),
    relatedId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const loyaltyAccount = await getOrCreateLoyaltyAccount(ctx, user._id, args.clerkId);

    const newBalance = loyaltyAccount.points + args.points;
    const newTotalEarned = loyaltyAccount.totalEarned + args.points;

    // Update loyalty account
    await ctx.db.patch(loyaltyAccount._id, {
      points: newBalance,
      totalEarned: newTotalEarned,
      lastUpdated: Date.now(),
    });

    // Create transaction record
    await ctx.db.insert("loyaltyTransactions", {
      userId: user._id,
      clerkId: args.clerkId,
      type: "earned",
      amount: args.points,
      balance: newBalance,
      source: args.source,
      description: args.description,
      expiresAt: args.expiresAt,
      relatedId: args.relatedId,
      createdAt: Date.now(),
    });

    return {
      newBalance,
      totalEarned: newTotalEarned,
    };
  },
});

// Redeem points
export const redeemPoints = mutation({
  args: {
    clerkId: v.string(),
    points: v.number(),
    description: v.string(),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.points <= 0) {
      throw new Error("Points must be positive");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const loyaltyAccount = await getOrCreateLoyaltyAccount(ctx, user._id, args.clerkId);

    if (loyaltyAccount.points < args.points) {
      throw new Error("Insufficient points");
    }

    const newBalance = loyaltyAccount.points - args.points;
    const newTotalRedeemed = loyaltyAccount.totalRedeemed + args.points;

    // Update loyalty account
    await ctx.db.patch(loyaltyAccount._id, {
      points: newBalance,
      totalRedeemed: newTotalRedeemed,
      lastUpdated: Date.now(),
    });

    // Create transaction record
    await ctx.db.insert("loyaltyTransactions", {
      userId: user._id,
      clerkId: args.clerkId,
      type: "redeemed",
      amount: -args.points,
      balance: newBalance,
      source: "redemption",
      description: args.description,
      relatedId: args.relatedId,
      createdAt: Date.now(),
    });

    return {
      newBalance,
      totalRedeemed: newTotalRedeemed,
    };
  },
});

// Get user's loyalty points balance
export const getLoyaltyBalance = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const loyaltyAccount = await ctx.db
      .query("loyaltyPoints")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!loyaltyAccount) {
      return {
        points: 0,
        totalEarned: 0,
        totalRedeemed: 0,
      };
    }

    return {
      points: loyaltyAccount.points,
      totalEarned: loyaltyAccount.totalEarned,
      totalRedeemed: loyaltyAccount.totalRedeemed,
    };
  },
});

// Get user's loyalty transaction history
export const getLoyaltyHistory = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .collect();

    return transactions;
  },
});

// Admin: Adjust points (manual adjustment)
export const adjustPoints = mutation({
  args: {
    clerkId: v.string(),
    points: v.number(), // Can be positive or negative
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (currentUser?.role !== "admin" && currentUser?.role !== "superadmin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const loyaltyAccount = await getOrCreateLoyaltyAccount(ctx, user._id, args.clerkId);

    const newBalance = loyaltyAccount.points + args.points;

    // Prevent negative balance (or allow it based on business rules)
    if (newBalance < 0) {
      throw new Error("Cannot adjust points below zero");
    }

    // Update loyalty account
    if (args.points > 0) {
      await ctx.db.patch(loyaltyAccount._id, {
        points: newBalance,
        totalEarned: loyaltyAccount.totalEarned + args.points,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.patch(loyaltyAccount._id, {
        points: newBalance,
        totalRedeemed: loyaltyAccount.totalRedeemed + Math.abs(args.points),
        lastUpdated: Date.now(),
      });
    }

    // Create transaction record
    await ctx.db.insert("loyaltyTransactions", {
      userId: user._id,
      clerkId: args.clerkId,
      type: "adjusted",
      amount: args.points,
      balance: newBalance,
      source: "admin_adjustment",
      description: args.description,
      createdAt: Date.now(),
    });

    return {
      newBalance,
    };
  },
});

