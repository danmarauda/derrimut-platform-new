import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Workout Plan Adjustments Based on Progress
 * Automatically adjusts workout plans based on user progress and check-ins
 */

// Analyze user progress and suggest workout plan adjustments
export const analyzeWorkoutProgress = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get active fitness plan
    const activePlan = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.clerkId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!activePlan) {
      return { needsAdjustment: false, message: "No active plan found" };
    }

    // Get check-in history (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentCheckIns = await ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .filter((q) => q.gte(q.field("checkInTime"), thirtyDaysAgo))
      .collect();

    // Get challenge completions
    const challengeCompletions = await ctx.db
      .query("challengeParticipations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("completed"), true))
      .collect();

    // Calculate metrics
    const checkInFrequency = recentCheckIns.length / 30; // Check-ins per day
    const expectedFrequency = activePlan.workoutPlan.schedule.length / 7; // Expected workouts per day
    const consistency = checkInFrequency / expectedFrequency;

    // Determine if adjustment is needed
    let needsAdjustment = false;
    let adjustmentType: "increase" | "decrease" | "maintain" | null = null;
    let recommendations: string[] = [];

    if (consistency > 1.2) {
      // User is exceeding expectations - suggest increasing difficulty
      needsAdjustment = true;
      adjustmentType = "increase";
      recommendations.push("You're consistently exceeding your workout schedule!");
      recommendations.push("Consider increasing weights or adding more challenging exercises");
      recommendations.push("Add an extra workout day to your schedule");
    } else if (consistency < 0.7) {
      // User is struggling - suggest decreasing difficulty
      needsAdjustment = true;
      adjustmentType = "decrease";
      recommendations.push("You're finding it challenging to maintain your current schedule");
      recommendations.push("Consider reducing workout frequency or intensity");
      recommendations.push("Focus on consistency over intensity");
    } else {
      adjustmentType = "maintain";
      recommendations.push("You're maintaining a good workout consistency");
      recommendations.push("Keep up the great work!");
    }

    return {
      needsAdjustment,
      adjustmentType,
      recommendations,
      metrics: {
        checkInFrequency,
        expectedFrequency,
        consistency: Math.round(consistency * 100) / 100,
        recentCheckIns: recentCheckIns.length,
        challengeCompletions: challengeCompletions.length,
      },
    };
  },
});

// Generate adjusted workout plan using Gemini AI
export const generateAdjustedWorkoutPlan = action({
  args: {
    clerkId: v.string(),
    adjustmentType: v.union(v.literal("increase"), v.literal("decrease"), v.literal("maintain")),
  },
  handler: async (ctx, args): Promise<{ success: boolean; planId: any; adjustedWorkoutPlan: any }> => {
    // Get user via query since actions don't have direct db access
    const users = await ctx.runQuery(api.users.getAllUsers, {});
    const user = users.find((u: any) => u.clerkId === args.clerkId);

    if (!user) {
      throw new Error("User not found");
    }

    // Get current plan
    const currentPlan = await ctx.runQuery(api.plans.getUserPlans, {
      userId: args.clerkId,
    });

    const activePlan = currentPlan?.find((p: any) => p.isActive);

    if (!activePlan) {
      throw new Error("No active plan found");
    }

    // Get progress analysis
    const progress = await ctx.runQuery(api.workoutPlanAdjustments.analyzeWorkoutProgress, {
      clerkId: args.clerkId,
    });

    // Call Gemini AI to generate adjusted plan
    const nextjsUrl = process.env.NEXTJS_URL || process.env.NEXT_PUBLIC_CONVEX_URL?.replace('/convex', '') || 'http://localhost:3000';
    const response = await fetch(`${nextjsUrl}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `You are an experienced fitness coach. Adjust the following workout plan based on the user's progress.

Current Plan:
${JSON.stringify(activePlan.workoutPlan, null, 2)}

User Progress:
- Check-in consistency: ${progress.metrics?.consistency || 0}
- Recent check-ins: ${progress.metrics?.recentCheckIns || 0}
- Challenge completions: ${progress.metrics?.challengeCompletions || 0}

Adjustment Type: ${args.adjustmentType}

${args.adjustmentType === "increase" ? "Increase the difficulty, add more challenging exercises, or increase frequency." : args.adjustmentType === "decrease" ? "Decrease the difficulty, reduce frequency, or simplify exercises." : "Maintain current level but optimize for better results."}

Return ONLY a JSON object with this EXACT structure:
{
  "schedule": ["Monday", "Wednesday", "Friday"],
  "exercises": [
    {
      "day": "Monday",
      "routines": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": 10
        }
      ]
    }
  ]
}

DO NOT add any other fields.`,
        model: "gemini-2.5-flash",
        temperature: 0.4,
        responseFormat: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate adjusted plan");
    }

    const data = await response.json();
    const adjustedWorkoutPlan = JSON.parse(data.text);

    // Create new adjusted plan
    const newPlanId: any = await ctx.runMutation(api.plans.createPlan, {
      userId: args.clerkId,
      name: `Adjusted ${activePlan.name} - ${new Date().toLocaleDateString()}`,
      workoutPlan: adjustedWorkoutPlan,
      dietPlan: activePlan.dietPlan, // Keep diet plan the same
      isActive: true,
    });

    return {
      success: true,
      planId: newPlanId,
      adjustedWorkoutPlan,
    };
  },
});

// Get workout plan adjustment history
export const getAdjustmentHistory = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const plans = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.clerkId))
      .order("desc")
      .collect();

    return plans.map((plan) => ({
      _id: plan._id,
      name: plan.name,
      createdAt: plan._creationTime,
      isActive: plan.isActive,
    }));
  },
});

