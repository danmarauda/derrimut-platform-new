import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Workout Logging System
 * Log exercises, track PRs, create templates
 */

// Log a workout
export const logWorkout = mutation({
  args: {
    workoutName: v.string(),
    workoutDate: v.number(),
    duration: v.number(),
    exercises: v.array(v.object({
      exerciseName: v.string(),
      sets: v.array(v.object({
        reps: v.number(),
        weight: v.number(),
        restTime: v.optional(v.number()),
        notes: v.optional(v.string()),
        isPr: v.optional(v.boolean()),
      })),
      notes: v.optional(v.string()),
    })),
    caloriesBurned: v.optional(v.number()),
    notes: v.optional(v.string()),
    templateId: v.optional(v.id("workoutTemplates")),
    shared: v.optional(v.boolean()),
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

    // Calculate total volume
    const totalVolume = args.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.weight * set.reps);
      }, 0);
    }, 0);

    const workoutId = await ctx.db.insert("workoutLogs", {
      userId: user._id,
      clerkId: identity.subject,
      workoutName: args.workoutName,
      workoutDate: args.workoutDate,
      duration: args.duration,
      exercises: args.exercises,
      totalVolume,
      caloriesBurned: args.caloriesBurned,
      notes: args.notes,
      templateId: args.templateId,
      shared: args.shared || false,
      createdAt: Date.now(),
    });

    // Check for PRs and notify
    const prs = args.exercises.flatMap((exercise) =>
      exercise.sets.filter((set) => set.isPr).map((set) => ({
        exercise: exercise.exerciseName,
        weight: set.weight,
        reps: set.reps,
      }))
    );

    if (prs.length > 0) {
      await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
        userId: user._id,
        clerkId: identity.subject,
        type: "achievement",
        title: "🎉 Personal Records!",
        message: `You hit ${prs.length} PR${prs.length > 1 ? "s" : ""} in this workout!`,
        link: `/profile/workouts`,
        sendPush: true,
      });
    }

    // Award loyalty points for workout completion
    await ctx.scheduler.runAfter(0, api.loyalty.addPointsWithExpiration, {
      clerkId: identity.subject,
      points: 50, // 50 points for completing a workout
      source: "check_in", // Using check_in source for now
      description: `Workout completed: ${args.workoutName}`,
      relatedId: workoutId,
    });

    return workoutId;
  },
});

// Get workout history
export const getWorkoutHistory = query({
  args: {
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
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
      return [];
    }

    let workouts = await ctx.db
      .query("workoutLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      workouts = workouts.filter((workout) => {
        const date = workout.workoutDate;
        if (args.startDate && date < args.startDate) return false;
        if (args.endDate && date > args.endDate) return false;
        return true;
      });
    }

    return workouts.slice(0, args.limit || 50);
  },
});

// Get PRs (Personal Records)
export const getPersonalRecords = query({
  args: {
    exerciseName: v.optional(v.string()),
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
      return [];
    }

    const workouts = await ctx.db
      .query("workoutLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const prs: Record<string, any> = {};

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        if (args.exerciseName && exercise.exerciseName !== args.exerciseName) {
          return;
        }

        exercise.sets.forEach((set) => {
          if (set.isPr) {
            const key = exercise.exerciseName;
            if (!prs[key] || set.weight * set.reps > (prs[key].weight * prs[key].reps)) {
              prs[key] = {
                exerciseName: exercise.exerciseName,
                weight: set.weight,
                reps: set.reps,
                volume: set.weight * set.reps,
                date: workout.workoutDate,
                workoutId: workout._id,
              };
            }
          }
        });
      });
    });

    return Object.values(prs);
  },
});

// Create workout template
export const createWorkoutTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    exercises: v.array(v.object({
      exerciseName: v.string(),
      sets: v.number(),
      reps: v.number(),
      weight: v.optional(v.number()),
      restTime: v.optional(v.number()),
      notes: v.optional(v.string()),
    })),
    estimatedDuration: v.number(),
    category: v.optional(v.string()),
    isPublic: v.boolean(),
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

    const templateId = await ctx.db.insert("workoutTemplates", {
      userId: user._id,
      clerkId: identity.subject,
      name: args.name,
      description: args.description,
      exercises: args.exercises,
      estimatedDuration: args.estimatedDuration,
      category: args.category,
      isPublic: args.isPublic,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return templateId;
  },
});

// Get workout templates
export const getWorkoutTemplates = query({
  args: {
    includePublic: v.optional(v.boolean()),
    category: v.optional(v.string()),
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
      return [];
    }

    // Get user's templates
    let templates = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Include public templates if requested
    if (args.includePublic) {
      const publicTemplates = await ctx.db
        .query("workoutTemplates")
        .withIndex("by_public", (q) => q.eq("isPublic", true))
        .collect();

      templates = [...templates, ...publicTemplates.filter((t) => t.userId !== user._id)];
    }

    // Filter by category if provided
    if (args.category) {
      templates = templates.filter((t) => t.category === args.category);
    }

    return templates;
  },
});

// Get workout analytics
export const getWorkoutAnalytics = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
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

    const workouts = await ctx.db
      .query("workoutLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("workoutDate"), args.startDate) && q.lte(q.field("workoutDate"), args.endDate))
      .collect();

    const analytics = {
      totalWorkouts: workouts.length,
      totalDuration: workouts.reduce((sum, w) => sum + w.duration, 0),
      totalVolume: workouts.reduce((sum, w) => sum + w.totalVolume, 0),
      totalCaloriesBurned: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      averageDuration: workouts.length > 0 ? workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length : 0,
      averageVolume: workouts.length > 0 ? workouts.reduce((sum, w) => sum + w.totalVolume, 0) / workouts.length : 0,
      mostPerformedExercises: {} as Record<string, number>,
      prCount: 0,
    };

    // Count exercise frequency
    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        analytics.mostPerformedExercises[exercise.exerciseName] =
          (analytics.mostPerformedExercises[exercise.exerciseName] || 0) + 1;

        exercise.sets.forEach((set) => {
          if (set.isPr) analytics.prCount++;
        });
      });
    });

    return analytics;
  },
});

