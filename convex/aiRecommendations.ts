import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * AI-Powered Recommendations System
 * Provides personalized recommendations for classes, trainers, products, and content
 */

// Get personalized class recommendations
export const getClassRecommendations = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    // Get user's check-in history to determine preferred times
    const checkIns = await ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .collect();
    const recentCheckIns = checkIns.slice(0, 30);

    // Analyze check-in patterns
    const timePreferences: Record<number, number> = {}; // hour -> count
    recentCheckIns.forEach((checkIn: any) => {
      const hour = new Date(checkIn.checkInTime).getHours();
      timePreferences[hour] = (timePreferences[hour] || 0) + 1;
    });

    // Get user's fitness plan to understand goals - using plans table instead
    // Note: fitnessPlans table doesn't exist, using plans table
    const fitnessPlan: any = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.clerkId))
      .order("desc")
      .first();

    // Get all classes - groupFitnessClasses table doesn't exist, return empty for now
    // const allClasses = await ctx.db.query("groupFitnessClasses").collect();
    const allClasses: any[] = [];

    // Score classes based on user preferences
    const scoredClasses = allClasses.map((classItem: any) => {
      let score = 0;

      // Prefer classes at user's typical workout time
      const classHour = new Date((classItem as any).startTime || Date.now()).getHours();
      if (timePreferences[classHour]) {
        score += timePreferences[classHour] * 2;
      }

      // Prefer classes at user's location - locationId doesn't exist on users
      // if ((classItem as any).locationId === user.locationId) {
      //   score += 10;
      // }

      // If user has fitness plan, prefer classes matching their goals
      if (fitnessPlan) {
        const goal = ((fitnessPlan as any).fitnessGoal || "").toLowerCase();
        const className = ((classItem as any).name || "").toLowerCase();
        
        if (goal.includes("strength") && (className.includes("strength") || className.includes("weight"))) {
          score += 5;
        }
        if (goal.includes("cardio") && (className.includes("cardio") || className.includes("hiit"))) {
          score += 5;
        }
        if (goal.includes("flexibility") && (className.includes("yoga") || className.includes("stretch"))) {
          score += 5;
        }
      }

      return { ...classItem, recommendationScore: score };
    });

    // Sort by score and return top recommendations
    scoredClasses.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return scoredClasses.slice(0, args.limit || 5);
  },
});

// Get trainer recommendations based on goals
export const getTrainerRecommendations = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    // Get user's fitness plan - using plans table instead
    const fitnessPlan: any = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.clerkId))
      .order("desc")
      .first();

    // Get all trainers
    const allTrainers = await ctx.db.query("trainerProfiles").collect();

    // Score trainers based on user goals and specializations
    const scoredTrainers = allTrainers.map((trainer: any) => {
      let score = 0;

      if (fitnessPlan) {
        const goal = ((fitnessPlan as any).fitnessGoal || "").toLowerCase();
        const specializations = (trainer.specializations || []).map((s: any) => s.toLowerCase());

        // Match specializations to goals
        specializations.forEach((spec: any) => {
          if (goal.includes("strength") && spec.includes("strength")) score += 10;
          if (goal.includes("cardio") && spec.includes("cardio")) score += 10;
          if (goal.includes("weight") && spec.includes("weight")) score += 10;
          if (goal.includes("flexibility") && spec.includes("yoga")) score += 10;
        });
      }

      // Prefer trainers at user's location - locationId doesn't exist
      // if (trainer.locationId === user.locationId) {
      //   score += 5;
      // }

      // Prefer highly rated trainers
      if (trainer.rating && trainer.rating >= 4.5) {
        score += 5;
      }

      return { ...trainer, recommendationScore: score };
    });

    scoredTrainers.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return scoredTrainers.slice(0, args.limit || 5);
  },
});

// Get product recommendations (marketplace)
export const getProductRecommendations = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    // Get user's purchase history
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user_clerk", (q: any) => q.eq("userClerkId", args.clerkId))
      .order("desc")
      .collect();
    const recentOrders = orders.slice(0, 10);

    // Get user's fitness plan to understand goals - using plans table
    const fitnessPlan: any = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.clerkId))
      .order("desc")
      .first();

    // Get all products - products table doesn't exist, skip for now
    // const allProducts = await ctx.db.query("products").collect();
    const allProducts: any[] = [];

    // Score products based on purchase history and goals
    const scoredProducts = allProducts.map((product: any) => {
      let score = 0;

      // Prefer products user has purchased before
      const hasPurchased = recentOrders.some((order: any) =>
        order.items.some((item: any) => item.productId === product._id)
      );
      if (hasPurchased) {
        score += 10;
      }

      // Prefer products matching fitness goals
      if (fitnessPlan) {
        const goal = ((fitnessPlan as any).fitnessGoal || "").toLowerCase();
        const productName = ((product as any).name || "").toLowerCase();
        const category = ((product as any).category || "").toLowerCase();

        if (goal.includes("muscle") && (category.includes("protein") || category.includes("supplement"))) {
          score += 5;
        }
        if (goal.includes("weight") && (category.includes("weight") || category.includes("loss"))) {
          score += 5;
        }
      }

      // Prefer highly rated products
      if (product.rating && product.rating >= 4.5) {
        score += 3;
      }

      // Prefer products on sale
      if (product.discountPercent && product.discountPercent > 0) {
        score += 2;
      }

      return { ...product, recommendationScore: score };
    });

    scoredProducts.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return scoredProducts.slice(0, args.limit || 5);
  },
});

// Get optimal workout time suggestion
export const getOptimalWorkoutTime = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const checkIns = await ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .collect();
    const recentCheckInsForHour = checkIns.slice(0, 30);

    if (recentCheckInsForHour.length === 0) {
      return { suggestedHour: 18, confidence: "low" }; // Default: 6 PM
    }

    // Count check-ins by hour
    const hourCounts: Record<number, number> = {};
    checkIns.forEach((checkIn) => {
      const hour = new Date(checkIn.checkInTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Find most common hour
    let maxCount = 0;
    let suggestedHour = 18;

    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        suggestedHour = parseInt(hour);
      }
    });

    const confidence = checkIns.length >= 20 ? "high" : checkIns.length >= 10 ? "medium" : "low";

    return {
      suggestedHour,
      suggestedTime: `${suggestedHour}:00`,
      confidence,
      checkInCount: checkIns.length,
    };
  },
});

// Get personalized blog post recommendations
export const getBlogRecommendations = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    // Get user's fitness plan - using plans table
    const fitnessPlan: any = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.clerkId))
      .order("desc")
      .first();

    // Get all blog posts - blogPosts table doesn't exist, return empty for now
    // const allPosts = await ctx.db.query("blogPosts").collect();
    const allPosts: any[] = [];

    // Score posts based on user goals and interests
    const scoredPosts = allPosts.map((post: any) => {
      let score = 0;

      if (fitnessPlan) {
        const goal = ((fitnessPlan as any).fitnessGoal || "").toLowerCase();
        const title = ((post as any).title || "").toLowerCase();
        const content = ((post as any).content || "").toLowerCase();
        const category = ((post as any).category || "").toLowerCase();

        // Match content to goals
        if (goal.includes("strength") && (title.includes("strength") || category.includes("strength"))) {
          score += 10;
        }
        if (goal.includes("cardio") && (title.includes("cardio") || category.includes("cardio"))) {
          score += 10;
        }
        if (goal.includes("weight") && (title.includes("weight") || category.includes("weight"))) {
          score += 10;
        }
      }

      // Prefer recent posts
      const daysSincePublished = (Date.now() - post.createdAt) / (1000 * 60 * 60 * 24);
      if (daysSincePublished < 30) {
        score += 5;
      }

      // Prefer popular posts
      if (post.likes && post.likes > 10) {
        score += 3;
      }

      return { ...post, recommendationScore: score };
    });

    scoredPosts.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return scoredPosts.slice(0, args.limit || 5);
  },
});

// Get recipe recommendations based on diet plan
export const getRecipeRecommendations = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    // Get user's diet plan - using plans table
    const fitnessPlan: any = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.clerkId))
      .order("desc")
      .first();

    // Get all recipes - recipes table doesn't exist, return empty for now
    // const allRecipes = await ctx.db.query("recipes").collect();
    const allRecipes: any[] = [];

    // Score recipes based on diet plan
    const scoredRecipes = allRecipes.map((recipe: any) => {
      let score = 0;

      if (fitnessPlan && (fitnessPlan as any).dietPlan) {
        const dailyCalories = ((fitnessPlan as any).dietPlan.dailyCalories || 2000);
        const recipeCalories = ((recipe as any).calories || 0);

        // Prefer recipes matching calorie goals
        if (recipeCalories > 0 && recipeCalories <= dailyCalories * 0.4) {
          score += 5;
        }

        // Match meal types
        const mealType = ((recipe as any).category || "").toLowerCase();
        if (mealType.includes("breakfast") || mealType.includes("pre-workout")) {
          score += 3;
        }
      }

      // Prefer high-protein recipes
      if (recipe.protein && recipe.protein > 20) {
        score += 3;
      }

      return { ...recipe, recommendationScore: score };
    });

    scoredRecipes.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return scoredRecipes.slice(0, args.limit || 5);
  },
});

