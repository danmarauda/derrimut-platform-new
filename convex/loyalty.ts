import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Get or create loyalty points account for user
async function getOrCreateLoyaltyAccount(ctx: any, userId: string, clerkId: string) {
  let loyaltyAccount = await ctx.db
    .query("loyaltyPoints")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
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

// Redeem points for specific rewards
export const redeemPointsForReward = mutation({
  args: {
    clerkId: v.string(),
    rewardType: v.union(
      v.literal("personal_training"), // 1000 points
      v.literal("free_month"), // 5000 points
      v.literal("marketplace_discount"), // Variable points
      v.literal("class_pass") // Variable points
    ),
    rewardId: v.optional(v.string()), // For marketplace discounts or class passes
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const loyaltyAccount = await getOrCreateLoyaltyAccount(ctx, user._id, args.clerkId);

    // Determine points cost based on reward type
    let pointsCost = 0;
    let description = "";

    switch (args.rewardType) {
      case "personal_training":
        pointsCost = 1000;
        description = "Free Personal Training Session";
        break;
      case "free_month":
        pointsCost = 5000;
        description = "Free Month Membership";
        break;
      case "marketplace_discount":
        // Would need to look up discount amount from rewardId
        pointsCost = 100; // Default
        description = "Marketplace Discount";
        break;
      case "class_pass":
        pointsCost = 500; // Default
        description = "Class Pass";
        break;
    }

    if (loyaltyAccount.points < pointsCost) {
      throw new Error(`Insufficient points. Need ${pointsCost}, have ${loyaltyAccount.points}`);
    }

    // Redeem points
    return await ctx.runMutation(api.loyalty.redeemPoints, {
      clerkId: args.clerkId,
      points: pointsCost,
      description,
      relatedId: args.rewardId,
    });
  },
});

// Check and expire old points (12 months expiration)
export const expireOldPoints = mutation({
  args: {},
  handler: async (ctx) => {
    const twelveMonthsAgo = Date.now() - 12 * 30 * 24 * 60 * 60 * 1000;

    // Get all transactions with expiration dates
    const transactions = await ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_created", (q) => q.gte("createdAt", twelveMonthsAgo))
      .collect();

    const expiredTransactions = transactions.filter(
      (t) => t.expiresAt && t.expiresAt < Date.now() && t.type === "earned" && t.amount > 0
    );

    let totalExpired = 0;

    for (const transaction of expiredTransactions) {
      const loyaltyAccount = await ctx.db
        .query("loyaltyPoints")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", transaction.clerkId))
        .first();

      if (loyaltyAccount && loyaltyAccount.points >= transaction.amount) {
        // Check if already expired
        const existingExpiration = await ctx.db
          .query("loyaltyTransactions")
          .withIndex("by_user", (q) => q.eq("userId", transaction.userId))
          .filter((q) =>
            q.and(
              q.eq(q.field("type"), "expired"),
              q.eq(q.field("relatedId"), transaction._id)
            )
          )
          .first();

        if (!existingExpiration) {
          // Create expiration transaction
          await ctx.db.insert("loyaltyTransactions", {
            userId: transaction.userId,
            clerkId: transaction.clerkId,
            type: "expired",
            amount: -transaction.amount,
            balance: loyaltyAccount.points - transaction.amount,
            source: "admin_adjustment",
            description: `Points expired: ${transaction.description}`,
            relatedId: transaction._id,
            createdAt: Date.now(),
          });

          // Update loyalty account
          await ctx.db.patch(loyaltyAccount._id, {
            points: loyaltyAccount.points - transaction.amount,
            lastUpdated: Date.now(),
          });

          totalExpired += transaction.amount;
        }
      }
    }

    return { expiredPoints: totalExpired, transactionsProcessed: expiredTransactions.length };
  },
});

// Add points with expiration (12 months from now)
export const addPointsWithExpiration = mutation({
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
  },
  handler: async (ctx, args): Promise<any> => {
    const expiresAt = Date.now() + 12 * 30 * 24 * 60 * 60 * 1000; // 12 months
    return await ctx.runMutation(api.loyalty.addPoints, {
      ...args,
      expiresAt,
    });
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

