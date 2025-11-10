import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Member Check-In System
 * QR Code and App-based check-in for gym members
 */

// Generate QR code for check-in
function generateQRCode(userId: string, locationId: string): string {
  const timestamp = Date.now();
  return `${userId}-${locationId}-${timestamp}`;
}

// Check in member
export const checkInMember = mutation({
  args: {
    locationId: v.id("organizations"),
    qrCode: v.optional(v.string()),
    method: v.union(v.literal("qr"), v.literal("app"), v.literal("manual")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has active membership
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      throw new Error("Active membership required to check in");
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    const existingCheckIn = await ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .filter((q) => 
        q.and(
          q.gte(q.field("checkInTime"), todayStart),
          q.lt(q.field("checkInTime"), todayEnd),
          q.eq(q.field("locationId"), args.locationId)
        )
      )
      .first();

    if (existingCheckIn && !existingCheckIn.checkOutTime) {
      throw new Error("Already checked in. Please check out first.");
    }

    const qrCode = args.qrCode || generateQRCode(user._id, args.locationId);
    const checkInTime = Date.now();

    const checkInId = await ctx.db.insert("memberCheckIns", {
      userId: user._id,
      clerkId: identity.subject,
      locationId: args.locationId,
      checkInTime,
      qrCode,
      method: args.method,
      notes: args.notes,
      createdAt: checkInTime,
    });

    // Update engagement score
    await updateEngagementScore(ctx, identity.subject);

    // Check for achievements
    await checkAchievements(ctx, identity.subject, "check_in");

    return checkInId;
  },
});

// Check out member
export const checkOutMember = mutation({
  args: {
    checkInId: v.id("memberCheckIns"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const checkIn = await ctx.db.get(args.checkInId);
    if (!checkIn) {
      throw new Error("Check-in not found");
    }

    if (checkIn.clerkId !== identity.subject) {
      throw new Error("Not authorized");
    }

    if (checkIn.checkOutTime) {
      throw new Error("Already checked out");
    }

    const checkOutTime = Date.now();
    const duration = Math.floor((checkOutTime - checkIn.checkInTime) / (1000 * 60));

    await ctx.db.patch(args.checkInId, {
      checkOutTime,
      duration,
    });

    // Update engagement score
    await updateEngagementScore(ctx, identity.subject);

    return { success: true, duration };
  },
});

// Get member check-in history
export const getMemberCheckIns = query({
  args: {
    clerkId: v.optional(v.string()),
    locationId: v.optional(v.id("organizations")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = args.clerkId || identity.subject;
    let query = ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId));

    if (args.locationId) {
      query = query.filter((q) => q.eq(q.field("locationId"), args.locationId));
    }

    const checkIns = await query
      .order("desc")
      .take(args.limit || 50);

    // Get location details
    const checkInsWithLocations = await Promise.all(
      checkIns.map(async (checkIn) => {
        const location = await ctx.db.get(checkIn.locationId);
        return {
          ...checkIn,
          location: location ? {
            name: location.name,
            address: location.address,
          } : null,
        };
      })
    );

    return checkInsWithLocations;
  },
});

// Get check-in streak
export const getCheckInStreak = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = args.clerkId || identity.subject;
    const checkIns = await ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .order("desc")
      .take(100);

    if (checkIns.length === 0) return { streak: 0, lastCheckIn: null };

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < checkIns.length; i++) {
      const checkInDate = new Date(checkIns[i].checkInTime);
      checkInDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    return {
      streak,
      lastCheckIn: checkIns[0]?.checkInTime || null,
      totalCheckIns: checkIns.length,
    };
  },
});

// Helper: Calculate streak (internal function)
async function calculateStreak(ctx: any, clerkId: string) {
  const checkIns = await ctx.db
    .query("memberCheckIns")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .order("desc")
    .take(100);

  if (checkIns.length === 0) return { streak: 0, lastCheckIn: null };

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < checkIns.length; i++) {
    const checkInDate = new Date(checkIns[i].checkInTime);
    checkInDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === i) {
      streak++;
    } else {
      break;
    }
  }

  return { streak, lastCheckIn: checkIns[0]?.checkInTime || null };
}

// Helper: Update engagement score
async function updateEngagementScore(ctx: any, clerkId: string) {
  const checkIns = await ctx.db
    .query("memberCheckIns")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .collect();

  const streakData = await calculateStreak(ctx, clerkId);
  const plans = await ctx.db
    .query("plans")
    .withIndex("by_user_id", (q) => q.eq("userId", clerkId))
    .filter((q) => q.eq(q.field("isActive"), true))
    .collect();

  const challenges = await ctx.db
    .query("challengeParticipations")
    .withIndex("by_user", (q) => {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();
      return user ? q.eq("userId", user._id) : q.eq("userId", "" as any);
    })
    .filter((q) => q.eq(q.field("completed"), true))
    .collect();

  // Calculate score (0-100)
  const checkInScore = Math.min(checkIns.length * 2, 40); // Max 40 points
  const streakScore = Math.min(streakData.streak * 5, 20); // Max 20 points
  const planScore = plans.length > 0 ? 20 : 0; // 20 points
  const challengeScore = Math.min(challenges.length * 5, 20); // Max 20 points

  const totalScore = checkInScore + streakScore + planScore + challengeScore;

  // Update or create engagement record
  const existing = await ctx.db
    .query("memberEngagement")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  if (!user) return;

  if (existing) {
    await ctx.db.patch(existing._id, {
      score: totalScore,
      checkInCount: checkIns.length,
      checkInStreak: streakData.streak,
      lastCheckIn: checkIns[0]?.checkInTime || null,
      workoutCompletions: plans.length,
      challengeCompletions: challenges.length,
      lastUpdated: Date.now(),
    });
  } else {
    await ctx.db.insert("memberEngagement", {
      userId: user._id,
      clerkId,
      score: totalScore,
      checkInCount: checkIns.length,
      checkInStreak: streakData.streak,
      lastCheckIn: checkIns[0]?.checkInTime || null,
      workoutCompletions: plans.length,
      challengeCompletions: challenges.length,
      socialInteractions: 0,
      lastUpdated: Date.now(),
    });
  }
}

// Helper: Check for achievements
async function checkAchievements(ctx: any, clerkId: string, action: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  if (!user) return;

  if (action === "check_in") {
    const checkIns = await ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .collect();

    const streakData = await calculateStreak(ctx, clerkId);

    // Check for achievements
    const achievements = [
      { count: 1, title: "First Steps", description: "Checked in for the first time", icon: "🎯" },
      { count: 10, title: "Getting Started", description: "10 check-ins completed", icon: "🔥" },
      { count: 50, title: "Dedicated", description: "50 check-ins completed", icon: "💪" },
      { count: 100, title: "Champion", description: "100 check-ins completed", icon: "🏆" },
      { count: 7, title: "Week Warrior", description: "7-day check-in streak", icon: "⚡", type: "streak" },
      { count: 30, title: "Monthly Master", description: "30-day check-in streak", icon: "🌟", type: "streak" },
    ];

    for (const achievement of achievements) {
      const count = achievement.type === "streak" ? streakData.streak : checkIns.length;
      
      if (count >= achievement.count) {
        // Check if already unlocked
        const existing = await ctx.db
          .query("achievements")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => q.eq(q.field("title"), achievement.title))
          .first();

        if (!existing) {
          await ctx.db.insert("achievements", {
            userId: user._id,
            clerkId,
            type: achievement.type === "streak" ? "check_in_streak" : "total_check_ins",
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            unlockedAt: Date.now(),
            metadata: { count },
          });

          // Create notification
          await ctx.db.insert("notifications", {
            userId: user._id,
            clerkId,
            type: "achievement",
            title: "Achievement Unlocked!",
            message: `You've unlocked: ${achievement.title}`,
            link: "/profile/achievements",
            read: false,
            createdAt: Date.now(),
          });
        }
      }
    }
  }
}

// Get member engagement score
export const getMemberEngagement = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = args.clerkId || identity.subject;
    const engagement = await ctx.db
      .query("memberEngagement")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!engagement) {
      // Initialize engagement
      await updateEngagementScore(ctx, clerkId);
      return await ctx.db
        .query("memberEngagement")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();
    }

    return engagement;
  },
});

// Get member achievements
export const getMemberAchievements = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = args.clerkId || identity.subject;
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .order("desc")
      .collect();

    return achievements;
  },
});