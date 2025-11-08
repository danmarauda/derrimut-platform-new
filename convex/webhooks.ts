import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Webhook Event Management for Idempotency
 * 
 * Prevents duplicate processing of webhook events by tracking
 * which events have already been processed.
 */

// Get webhook event by ID
export const getWebhookEvent = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("webhookEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .first();
    
    return event;
  },
});

// Create a new webhook event record
export const createWebhookEvent = mutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    processed: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if event already exists
    const existing = await ctx.db
      .query("webhookEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    return await ctx.db.insert("webhookEvents", {
      eventId: args.eventId,
      eventType: args.eventType,
      processed: args.processed,
      createdAt: Date.now(),
    });
  },
});

// Mark webhook event as processed
export const markWebhookEventProcessed = mutation({
  args: {
    eventId: v.string(),
    processed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("webhookEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .first();
    
    if (!event) {
      // Create if doesn't exist
      return await ctx.db.insert("webhookEvents", {
        eventId: args.eventId,
        eventType: "unknown",
        processed: args.processed,
        processedAt: Date.now(),
        createdAt: Date.now(),
      });
    }
    
    await ctx.db.patch(event._id, {
      processed: args.processed,
      processedAt: Date.now(),
    });
    
    return event._id;
  },
});

// Mark webhook event as failed
export const markWebhookEventFailed = mutation({
  args: {
    eventId: v.string(),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("webhookEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .first();
    
    if (!event) {
      // Create if doesn't exist
      return await ctx.db.insert("webhookEvents", {
        eventId: args.eventId,
        eventType: "unknown",
        processed: false,
        error: args.error,
        createdAt: Date.now(),
      });
    }
    
    await ctx.db.patch(event._id, {
      processed: false,
      error: args.error,
    });
    
    return event._id;
  },
});

