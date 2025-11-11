import { query, mutation, internalAction, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Predictive Analytics System
 * Predict churn risk, optimal check-in times, workout completion probability, etc.
 */

// Calculate member predictions
export const calculateMemberPredictions = internalAction({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    // Get user data
    const user: any = await ctx.runQuery(internal.predictiveAnalytics.getUserById, {
      userId: args.userId,
    });

    if (!user) {
      return null;
    }

    // Get check-in history
    const checkIns: any[] = await ctx.runQuery(internal.predictiveAnalytics.getCheckInHistory, {
      clerkId: args.clerkId,
    });

    // Get workout logs
    const workouts: any[] = await ctx.runQuery(internal.predictiveAnalytics.getWorkoutHistory, {
      clerkId: args.clerkId,
    });

    // Get membership info
    const membership = await ctx.runQuery(internal.predictiveAnalytics.getMembership, {
      clerkId: args.clerkId,
    });

    // Calculate churn risk (0-100)
    const daysSinceLastCheckIn = checkIns.length > 0
      ? Math.floor((Date.now() - checkIns[0].checkInTime) / (24 * 60 * 60 * 1000))
      : Math.floor((Date.now() - (user.createdAt || Date.now())) / (24 * 60 * 60 * 1000));

    let churnRisk = 0;
    if (daysSinceLastCheckIn > 90) churnRisk = 90;
    else if (daysSinceLastCheckIn > 60) churnRisk = 70;
    else if (daysSinceLastCheckIn > 30) churnRisk = 50;
    else if (daysSinceLastCheckIn > 14) churnRisk = 30;
    else if (daysSinceLastCheckIn > 7) churnRisk = 15;

    // Adjust based on check-in frequency
    const checkInFrequency = checkIns.length / Math.max(1, (Date.now() - (user.createdAt || Date.now())) / (24 * 60 * 60 * 1000)) * 30;
    if (checkInFrequency < 2) churnRisk += 20;
    else if (checkInFrequency < 4) churnRisk += 10;

    churnRisk = Math.min(100, churnRisk);

    const churnRiskLevel = churnRisk >= 70 ? "high" : churnRisk >= 40 ? "medium" : "low";

    // Calculate optimal check-in time
    const checkInHours = checkIns.map((ci: any) => new Date(ci.checkInTime).getHours());
    const hourCounts: Record<number, number> = {};
    checkInHours.forEach((hour: number) => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let optimalCheckInTime = 18; // Default: 6 PM
    let maxCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        optimalCheckInTime = parseInt(hour);
      }
    });

    // Calculate workout completion probability
    const totalWorkouts: number = workouts.length;
    const completedWorkouts = workouts.filter((w: any) => w.status === "completed").length;
    const workoutCompletionProbability: number = totalWorkouts > 0
      ? (completedWorkouts / totalWorkouts) * 100
      : 50; // Default 50% if no history

    // Calculate engagement score (0-100)
    let engagementScore = 0;
    if (checkIns.length > 0) engagementScore += 30;
    if (workouts.length > 0) engagementScore += 20;
    if (membership) engagementScore += 20;
    if (checkInFrequency >= 8) engagementScore += 30; // Very active
    else if (checkInFrequency >= 4) engagementScore += 20; // Active
    else if (checkInFrequency >= 2) engagementScore += 10; // Somewhat active

    // Predict next check-in
    const avgDaysBetweenCheckIns = checkIns.length > 1
      ? (checkIns[0].checkInTime - checkIns[checkIns.length - 1].checkInTime) / (checkIns.length - 1) / (24 * 60 * 60 * 1000)
      : 3; // Default 3 days

    const predictedNextCheckIn: number = checkIns.length > 0
      ? checkIns[0].checkInTime + avgDaysBetweenCheckIns * 24 * 60 * 60 * 1000
      : Date.now() + 3 * 24 * 60 * 60 * 1000;

    // Identify factors
    const factors: string[] = [];
    if (daysSinceLastCheckIn > 14) factors.push("low_engagement");
    if (checkInFrequency < 2) factors.push("infrequent_check_ins");
    if (workouts.length === 0) factors.push("no_workouts_logged");
    if (!membership) factors.push("no_active_membership");

    // Save prediction
    const existingPrediction = await ctx.runQuery(internal.predictiveAnalytics.getExistingPrediction, {
      userId: args.userId,
    });

    const predictionData: any = {
      userId: args.userId,
      clerkId: args.clerkId,
      churnRisk,
      churnRiskLevel,
      optimalCheckInTime,
      workoutCompletionProbability,
      engagementScore,
      predictedNextCheckIn,
      factors,
      calculatedAt: Date.now(),
      createdAt: Date.now(),
    };

    if (existingPrediction) {
      await ctx.runMutation(internal.predictiveAnalytics.updatePrediction, {
        predictionId: existingPrediction._id,
        ...predictionData,
      });
    } else {
      await ctx.runMutation(internal.predictiveAnalytics.createPrediction, predictionData);
    }

    return predictionData;
  },
});

// Get member predictions
export const getMemberPredictions = query({
  args: {
    clerkId: v.string(),
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
      return null;
    }

    // Check if admin
    const isAdmin = user.role === "admin" || user.role === "superadmin";
    if (!isAdmin && identity.subject !== args.clerkId) {
      throw new Error("Unauthorized");
    }

    const prediction = await ctx.db
      .query("memberPredictions")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .first();

    return prediction;
  },
});

// Get all high-risk members (admin)
export const getHighRiskMembers = query({
  args: {
    limit: v.optional(v.number()),
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

    const highRiskPredictions = await ctx.db
      .query("memberPredictions")
      .withIndex("by_risk_level", (q) => q.eq("churnRiskLevel", "high"))
      .order("desc")
      .take(args.limit || 50);

    // Enrich with user info
    const enriched = await Promise.all(
      highRiskPredictions.map(async (prediction) => {
        const predUser = await ctx.db.get(prediction.userId);
        return {
          ...prediction,
          userName: predUser?.name || "Unknown",
          userEmail: predUser?.email,
        };
      })
    );

    return enriched;
  },
});

// Internal queries for prediction calculation
export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.db.get(args.userId);
  },
});

export const getCheckInHistory = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args): Promise<any[]> => {
    const checkIns = await ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .collect();
    return checkIns.slice(0, 30);
  },
});

export const getWorkoutHistory = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args): Promise<any[]> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    const workoutLogs = await ctx.db
      .query("workoutLogs")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    return workoutLogs.slice(0, 30);
  },
});

export const getMembership = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.db
      .query("memberships")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .first();
  },
});

export const getExistingPrediction = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.db
      .query("memberPredictions")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .first();
  },
});

export const createPrediction = internalMutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
    churnRisk: v.number(),
    churnRiskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    optimalCheckInTime: v.optional(v.number()),
    workoutCompletionProbability: v.number(),
    engagementScore: v.number(),
    predictedNextCheckIn: v.optional(v.number()),
    factors: v.array(v.string()),
    calculatedAt: v.number(),
    createdAt: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"memberPredictions">> => {
    return await ctx.db.insert("memberPredictions", args);
  },
});

export const updatePrediction = internalMutation({
  args: {
    predictionId: v.id("memberPredictions"),
    churnRisk: v.number(),
    churnRiskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    optimalCheckInTime: v.optional(v.number()),
    workoutCompletionProbability: v.number(),
    engagementScore: v.number(),
    predictedNextCheckIn: v.optional(v.number()),
    factors: v.array(v.string()),
    calculatedAt: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    const { predictionId, ...updates } = args;
    await ctx.db.patch(predictionId, updates);
  },
});
