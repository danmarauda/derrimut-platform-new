import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Challenges & Competitions System
 * Members can join challenges and compete with others
 */

// Get all active challenges
export const getActiveChallenges = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const challenges = await ctx.db
      .query("challenges")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => 
        q.and(
          q.lte(q.field("startDate"), now),
          q.gte(q.field("endDate"), now)
        )
      )
      .collect();
    
    // Get participation counts
    const challengesWithStats = await Promise.all(
      challenges.map(async (challenge) => {
        const participations = await ctx.db
          .query("challengeParticipations")
          .withIndex("by_challenge", (q) => q.eq("challengeId", challenge._id))
          .collect();
        
        const completed = participations.filter(p => p.completed).length;
        
        return {
          ...challenge,
          participantCount: participations.length,
          completedCount: completed,
        };
      })
    );
    
    return challengesWithStats;
  },
});

// Get user's challenges
export const getUserChallenges = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = args.clerkId || identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const participations = await ctx.db
      .query("challengeParticipations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const challenges = await Promise.all(
      participations.map(async (participation) => {
        const challenge = await ctx.db.get(participation.challengeId);
        if (!challenge) return null;
        
        return {
          ...challenge,
          participation,
        };
      })
    );

    return challenges.filter(Boolean);
  },
});

// Join a challenge
export const joinChallenge = mutation({
  args: {
    challengeId: v.id("challenges"),
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

    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) {
      throw new Error("Challenge not found");
    }

    if (!challenge.isActive) {
      throw new Error("Challenge is not active");
    }

    // Check if already joined
    const existing = await ctx.db
      .query("challengeParticipations")
      .withIndex("by_challenge_user", (q) => 
        q.eq("challengeId", args.challengeId).eq("userId", user._id)
      )
      .first();

    if (existing) {
      throw new Error("Already joined this challenge");
    }

    // Create participation
    await ctx.db.insert("challengeParticipations", {
      challengeId: args.challengeId,
      userId: user._id,
      clerkId: identity.subject,
      progress: 0,
      completed: false,
      joinedAt: Date.now(),
    });

    // Add user to challenge participants array
    await ctx.db.patch(args.challengeId, {
      participants: [...challenge.participants, user._id],
    });

    return { success: true };
  },
});

// Update challenge progress
export const updateChallengeProgress = mutation({
  args: {
    challengeId: v.id("challenges"),
    progress: v.number(),
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

    const participation = await ctx.db
      .query("challengeParticipations")
      .withIndex("by_challenge_user", (q) => 
        q.eq("challengeId", args.challengeId).eq("userId", user._id)
      )
      .first();

    if (!participation) {
      throw new Error("Not participating in this challenge");
    }

    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) {
      throw new Error("Challenge not found");
    }

    const newProgress = Math.min(args.progress, challenge.goal);
    const completed = newProgress >= challenge.goal && !participation.completed;

    await ctx.db.patch(participation._id, {
      progress: newProgress,
      completed,
      completedAt: completed ? Date.now() : participation.completedAt,
    });

    // If completed, unlock achievement
    if (completed) {
      const existingAchievement = await ctx.db
        .query("achievements")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => 
          q.and(
            q.eq(q.field("type"), "challenge_completed"),
            q.eq(q.field("title"), challenge.title)
          )
        )
        .first();

      if (!existingAchievement) {
        await ctx.db.insert("achievements", {
          userId: user._id,
          clerkId: identity.subject,
          type: "challenge_completed",
          title: challenge.title,
          description: `Completed challenge: ${challenge.description}`,
          icon: "🏆",
          unlockedAt: Date.now(),
          metadata: { challengeId: challenge._id },
        });
      }
    }

    return { success: true, completed };
  },
});

// Create a challenge (admin only)
export const createChallenge = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("check_in"), v.literal("workout"), v.literal("social"), v.literal("streak")),
    goal: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    reward: v.optional(v.string()),
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

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      throw new Error("Unauthorized: Admin access required");
    }

    const challengeId = await ctx.db.insert("challenges", {
      title: args.title,
      description: args.description,
      type: args.type,
      goal: args.goal,
      startDate: args.startDate,
      endDate: args.endDate,
      reward: args.reward,
      isActive: true,
      participants: [],
      createdAt: Date.now(),
    });

    return challengeId;
  },
});

// Get challenge leaderboard
export const getChallengeLeaderboard = query({
  args: {
    challengeId: v.id("challenges"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const participations = await ctx.db
      .query("challengeParticipations")
      .withIndex("by_challenge", (q) => q.eq("challengeId", args.challengeId))
      .order("desc")
      .take(args.limit || 50);

    const leaderboard = await Promise.all(
      participations.map(async (participation) => {
        const user = await ctx.db.get(participation.userId);
        return {
          ...participation,
          userName: user?.name || "Unknown",
          userImage: user?.image,
        };
      })
    );

    // Sort by progress (descending), then by completedAt
    leaderboard.sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      if (a.completed && b.completed) {
        return (b.completedAt || 0) - (a.completedAt || 0);
      }
      return b.progress - a.progress;
    });

    return leaderboard;
  },
});
