import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Nutrition Tracking System
 * Food diary, calorie tracking, macro tracking with Nutritionix integration
 */

// Add nutrition entry
export const addNutritionEntry = mutation({
  args: {
    date: v.number(), // Timestamp for the day
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack"),
      v.literal("pre_workout"),
      v.literal("post_workout")
    ),
    foodName: v.string(),
    quantity: v.number(),
    unit: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fats: v.number(),
    fiber: v.optional(v.number()),
    sugar: v.optional(v.number()),
    sodium: v.optional(v.number()),
    barcode: v.optional(v.string()),
    nutritionixId: v.optional(v.string()),
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

    const entryId = await ctx.db.insert("nutritionEntries", {
      userId: user._id,
      clerkId: identity.subject,
      date: args.date,
      mealType: args.mealType,
      foodName: args.foodName,
      quantity: args.quantity,
      unit: args.unit,
      calories: args.calories,
      protein: args.protein,
      carbs: args.carbs,
      fats: args.fats,
      fiber: args.fiber,
      sugar: args.sugar,
      sodium: args.sodium,
      barcode: args.barcode,
      nutritionixId: args.nutritionixId,
      createdAt: Date.now(),
    });

    return entryId;
  },
});

// Get nutrition entries for a date
export const getNutritionEntries = query({
  args: {
    date: v.number(), // Timestamp for the day
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

    const entries = await ctx.db
      .query("nutritionEntries")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id).eq("date", args.date))
      .collect();

    return entries;
  },
});

// Get nutrition summary for a date
export const getNutritionSummary = query({
  args: {
    date: v.number(),
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

    const entries = await ctx.db
      .query("nutritionEntries")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id).eq("date", args.date))
      .collect();

    const summary = {
      totalCalories: entries.reduce((sum, e) => sum + e.calories, 0),
      totalProtein: entries.reduce((sum, e) => sum + e.protein, 0),
      totalCarbs: entries.reduce((sum, e) => sum + e.carbs, 0),
      totalFats: entries.reduce((sum, e) => sum + e.fats, 0),
      totalFiber: entries.reduce((sum, e) => sum + (e.fiber || 0), 0),
      totalSugar: entries.reduce((sum, e) => sum + (e.sugar || 0), 0),
      totalSodium: entries.reduce((sum, e) => sum + (e.sodium || 0), 0),
      mealBreakdown: {
        breakfast: entries.filter((e) => e.mealType === "breakfast"),
        lunch: entries.filter((e) => e.mealType === "lunch"),
        dinner: entries.filter((e) => e.mealType === "dinner"),
        snacks: entries.filter((e) => e.mealType === "snack"),
        preWorkout: entries.filter((e) => e.mealType === "pre_workout"),
        postWorkout: entries.filter((e) => e.mealType === "post_workout"),
      },
      entryCount: entries.length,
    };

    // Get user's diet plan for comparison
    const fitnessPlan = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (fitnessPlan && fitnessPlan.dietPlan) {
      // Add targetCalories and calorieProgress to summary
      (summary as any).targetCalories = fitnessPlan.dietPlan.dailyCalories;
      (summary as any).calorieProgress = (summary.totalCalories / fitnessPlan.dietPlan.dailyCalories) * 100;
    }

    return summary;
  },
});

// Search food via Nutritionix API
export const searchFood = action({
  args: {
    query: v.string(),
    barcode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nutritionixApiKey = process.env.NUTRITIONIX_API_KEY;
    const nutritionixAppId = process.env.NUTRITIONIX_APP_ID;

    if (!nutritionixApiKey || !nutritionixAppId) {
      throw new Error("Nutritionix API not configured");
    }

    try {
      let url = "https://trackapi.nutritionix.com/v2/search/instant";
      let body: any = {};

      if (args.barcode) {
        url = "https://trackapi.nutritionix.com/v2/search/item";
        body = { upc: args.barcode };
      } else {
        body = { query: args.query };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": nutritionixAppId,
          "x-app-key": nutritionixApiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Nutritionix API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error searching food:", error);
      throw new Error(`Failed to search food: ${error.message}`);
    }
  },
});

// Get nutrition analytics (weekly/monthly)
export const getNutritionAnalytics = query({
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

    const entries = await ctx.db
      .query("nutritionEntries")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("date"), args.startDate) && q.lte(q.field("date"), args.endDate))
      .collect();

    // Calculate daily averages
    const days = Math.ceil((args.endDate - args.startDate) / (24 * 60 * 60 * 1000)) || 1;
    const dailyEntries: Record<number, typeof entries> = {};

    entries.forEach((entry) => {
      const day = entry.date;
      if (!dailyEntries[day]) {
        dailyEntries[day] = [];
      }
      dailyEntries[day].push(entry);
    });

    const dailySummaries = Object.entries(dailyEntries).map(([date, dayEntries]) => {
      return {
        date: parseInt(date),
        calories: dayEntries.reduce((sum, e) => sum + e.calories, 0),
        protein: dayEntries.reduce((sum, e) => sum + e.protein, 0),
        carbs: dayEntries.reduce((sum, e) => sum + e.carbs, 0),
        fats: dayEntries.reduce((sum, e) => sum + e.fats, 0),
      };
    });

    const averages = {
      avgCalories: dailySummaries.reduce((sum, d) => sum + d.calories, 0) / days,
      avgProtein: dailySummaries.reduce((sum, d) => sum + d.protein, 0) / days,
      avgCarbs: dailySummaries.reduce((sum, d) => sum + d.carbs, 0) / days,
      avgFats: dailySummaries.reduce((sum, d) => sum + d.fats, 0) / days,
    };

    return {
      period: { startDate: args.startDate, endDate: args.endDate },
      dailySummaries,
      averages,
      totalEntries: entries.length,
    };
  },
});

