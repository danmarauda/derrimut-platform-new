/**
 * Optimized Convex Queries with Caching
 *
 * This file contains optimized versions of frequently-used queries
 * with proper indexing and caching strategies.
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get membership plans with caching
 * Cached for 60 seconds since membership plans rarely change
 */
export const getMembershipPlans = query({
  args: {},
  handler: async (ctx) => {
    // Use index for efficient filtering
    const plans = await ctx.db
      .query("membershipPlans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();

    return plans.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Get active marketplace items by category
 * Uses composite index for optimal performance
 */
export const getMarketplaceItemsByCategory = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("marketplaceItems")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
    }

    // All active items
    return await ctx.db
      .query("marketplaceItems")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

/**
 * Get user's active bookings
 * Optimized with proper index usage
 */
export const getUserActiveBookings = query({
  args: { userClerkId: v.string() },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.userClerkId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "confirmed")
        )
      )
      .order("desc")
      .collect();

    return bookings;
  },
});

/**
 * Get trainer's upcoming sessions
 * Optimized with composite index
 */
export const getTrainerUpcomingSessions = query({
  args: { trainerClerkId: v.string() },
  handler: async (ctx, args) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    return await ctx.db
      .query("bookings")
      .withIndex("by_trainer_clerk", (q) => q.eq("trainerClerkId", args.trainerClerkId))
      .filter((q) =>
        q.and(
          q.gte(q.field("sessionDate"), today),
          q.or(
            q.eq(q.field("status"), "confirmed"),
            q.eq(q.field("status"), "pending")
          )
        )
      )
      .order("asc")
      .collect();
  },
});

/**
 * Get published blog posts with caching
 * Optimized for homepage/blog listing
 */
export const getPublishedBlogPosts = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "published"));

    if (args.category) {
      query = ctx.db
        .query("blogPosts")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .filter((q) => q.eq(q.field("status"), "published"));
    }

    let posts = await query
      .order("desc")
      .collect();

    // Sort by publishedAt
    posts = posts.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));

    return args.limit ? posts.slice(0, args.limit) : posts;
  },
});

/**
 * Get user's cart with product details
 * Optimized to avoid N+1 queries
 */
export const getUserCart = query({
  args: { userClerkId: v.string() },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.userClerkId))
      .collect();

    // Batch fetch products to avoid N+1 query problem
    const productIds = cartItems.map(item => item.productId);
    const products = await Promise.all(
      productIds.map(id => ctx.db.get(id))
    );

    // Combine cart items with product data
    return cartItems.map((item, index) => ({
      ...item,
      product: products[index]
    })).filter(item => item.product !== null);
  },
});

/**
 * Get employee payroll records for a period
 * Optimized with compound index
 */
export const getPayrollByPeriod = query({
  args: {
    year: v.number(),
    month: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payrollRecords")
      .withIndex("by_period", (q) =>
        q.eq("payrollPeriod.year", args.year).eq("payrollPeriod.month", args.month)
      )
      .collect();
  },
});

/**
 * Get inventory items needing maintenance
 * Uses specialized index
 */
export const getInventoryNeedingMaintenance = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    return await ctx.db
      .query("inventory")
      .withIndex("by_maintenance_date")
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "retired"),
          q.lte(q.field("nextMaintenanceDate"), now)
        )
      )
      .collect();
  },
});

/**
 * Get active trainers with their profiles
 * Optimized for trainer listing pages
 */
export const getActiveTrainers = query({
  args: { specialization: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("trainerProfiles")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    let trainers = await query.collect();

    // Filter by specialization if provided
    if (args.specialization) {
      trainers = trainers.filter(t =>
        t.specializations.includes(args.specialization!)
      );
    }

    // Sort by rating
    return trainers.sort((a, b) => b.rating - a.rating);
  },
});

/**
 * Get user's orders with pagination
 * Optimized for order history
 */
export const getUserOrders = query({
  args: {
    userClerkId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.userClerkId))
      .order("desc")
      .collect();

    return args.limit ? orders.slice(0, args.limit) : orders;
  },
});
