import { mutation, query, action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import crypto from "crypto";

/**
 * Webhook System
 * Allow external systems to subscribe to platform events
 */

// Create webhook event (for idempotency tracking)
export const createWebhookEvent = mutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    processed: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("webhookEvents", {
      eventId: args.eventId,
      eventType: args.eventType,
      processed: args.processed,
      createdAt: Date.now(),
    });
  },
});

// Create webhook subscription
export const createWebhookSubscription = mutation({
  args: {
    url: v.string(),
    events: v.array(v.string()), // ["member.check_in", "booking.created", etc.]
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

    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString("hex");

    const subscriptionId = await ctx.db.insert("webhookSubscriptions", {
      url: args.url,
      events: args.events,
      secret,
      isActive: true,
      failureCount: 0,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { subscriptionId, secret };
  },
});

// Get webhook subscriptions
export const getWebhookSubscriptions = query({
  args: {},
  handler: async (ctx) => {
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

    return await ctx.db.query("webhookSubscriptions").order("desc").collect();
  },
});

// Update webhook subscription (public)
export const updateWebhookSubscription = mutation({
  args: {
    subscriptionId: v.id("webhookSubscriptions"),
    url: v.optional(v.string()),
    events: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      throw new Error("Unauthorized: Admin access required");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.url !== undefined) updates.url = args.url;
    if (args.events !== undefined) updates.events = args.events;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.subscriptionId, updates);
  },
});

// Delete webhook subscription
export const deleteWebhookSubscription = mutation({
  args: {
    subscriptionId: v.id("webhookSubscriptions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.subscriptionId);
    return { success: true };
  },
});

// Trigger webhook (internal - called when events occur)
export const triggerWebhook = internalAction({
  args: {
    eventType: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    // Get all active subscriptions for this event
    const subscriptions = await ctx.runQuery(internal.webhooks.getSubscriptionsForEvent, {
      eventType: args.eventType,
    });

    for (const subscription of subscriptions) {
      try {
        // Create signature
        const signature = crypto
          .createHmac("sha256", subscription.secret)
          .update(JSON.stringify(args.payload))
          .digest("hex");

        // Send webhook
        const response = await fetch(subscription.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Event": args.eventType,
            "X-Webhook-Timestamp": Date.now().toString(),
          },
          body: JSON.stringify(args.payload),
        });

        // Log webhook event
        await ctx.runMutation(internal.webhooks.logWebhookEvent, {
          subscriptionId: subscription._id,
          eventType: args.eventType,
          payload: JSON.stringify(args.payload),
          status: response.ok ? "success" : "failed",
          responseCode: response.status,
          responseBody: await response.text().catch(() => ""),
          retryCount: 0,
        });

        // Update subscription
        if (response.ok) {
          await ctx.runMutation(internal.webhooks.updateWebhookSubscriptionInternal, {
            subscriptionId: subscription._id,
            lastTriggeredAt: Date.now(),
            failureCount: 0,
          });
        } else {
          await ctx.runMutation(internal.webhooks.updateWebhookSubscriptionInternal, {
            subscriptionId: subscription._id,
            failureCount: subscription.failureCount + 1,
          });
        }
      } catch (error: any) {
        // Log failed webhook
        await ctx.runMutation(internal.webhooks.logWebhookEvent, {
          subscriptionId: subscription._id,
          eventType: args.eventType,
          payload: JSON.stringify(args.payload),
          status: "failed",
          responseCode: 0,
          responseBody: error.message,
          retryCount: 0,
        });

        // Increment failure count
        await ctx.runMutation(internal.webhooks.updateWebhookSubscriptionInternal, {
          subscriptionId: subscription._id,
          failureCount: subscription.failureCount + 1,
        });
      }
    }
  },
});

// Get subscriptions for event (internal)
export const getSubscriptionsForEvent = internalQuery({
  args: {
    eventType: v.string(),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("webhookSubscriptions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return subscriptions.filter((sub) => sub.events.includes(args.eventType));
  },
});

// Log webhook event (internal)
export const logWebhookEvent = internalMutation({
  args: {
    subscriptionId: v.id("webhookSubscriptions"),
    eventType: v.string(),
    payload: v.string(),
    status: v.union(v.literal("pending"), v.literal("success"), v.literal("failed")),
    responseCode: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    retryCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("webhookSubscriptionEvents", {
      subscriptionId: args.subscriptionId,
      eventType: args.eventType,
      payload: args.payload,
      status: args.status,
      responseCode: args.responseCode,
      responseBody: args.responseBody,
      retryCount: args.retryCount,
      triggeredAt: Date.now(),
      completedAt: args.status !== "pending" ? Date.now() : undefined,
    });
  },
});

// Update webhook subscription (internal)
export const updateWebhookSubscriptionInternal = internalMutation({
  args: {
    subscriptionId: v.id("webhookSubscriptions"),
    lastTriggeredAt: v.optional(v.number()),
    failureCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.lastTriggeredAt !== undefined) updates.lastTriggeredAt = args.lastTriggeredAt;
    if (args.failureCount !== undefined) updates.failureCount = args.failureCount;

    await ctx.db.patch(args.subscriptionId, updates);
  },
});

// Get webhook events
export const getWebhookEvents = query({
  args: {
    subscriptionId: v.optional(v.id("webhookSubscriptions")),
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

    let events = await ctx.db.query("webhookSubscriptionEvents").order("desc").collect();

    if (args.subscriptionId) {
      events = events.filter((e: any) => e.subscriptionId === args.subscriptionId);
    }

    return events.slice(0, args.limit || 100);
  },
});

// Retry failed webhook
export const retryWebhook = action({
  args: {
    eventId: v.id("webhookSubscriptionEvents"),
  },
  handler: async (ctx, args): Promise<any> => {
    const event: any = await ctx.runQuery(api.webhooks.getWebhookSubscriptionEvent, {
      eventId: args.eventId,
    });

    if (!event) {
      throw new Error("Event not found");
    }

    const subscription: any = await ctx.runQuery(api.webhooks.getWebhookSubscription, {
      subscriptionId: event.subscriptionId,
    });

    if (!subscription || !subscription.isActive) {
      throw new Error("Subscription not active");
    }

    try {
      const signature = crypto
        .createHmac("sha256", subscription.secret)
        .update(event.payload)
        .digest("hex");

      const response: any = await fetch(subscription.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": event.eventType,
          "X-Webhook-Timestamp": Date.now().toString(),
        },
        body: event.payload,
      });

      await ctx.runMutation(internal.webhooks.updateWebhookSubscriptionEvent, {
        eventId: args.eventId,
        status: response.ok ? "success" : "failed",
        responseCode: response.status,
        responseBody: await response.text().catch(() => ""),
        retryCount: event.retryCount + 1,
      });

      return { success: response.ok };
    } catch (error: any) {
      await ctx.runMutation(internal.webhooks.updateWebhookSubscriptionEvent, {
        eventId: args.eventId,
        status: "failed",
        retryCount: event.retryCount + 1,
      });

      throw error;
    }
  },
});

// Get webhook subscription event (for webhookSubscriptionEvents table)
export const getWebhookSubscriptionEvent = query({
  args: {
    eventId: v.id("webhookSubscriptionEvents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

// Get webhook event (for webhookEvents table)
export const getWebhookEvent = query({
  args: {
    eventId: v.id("webhookEvents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

// Get webhook subscription
export const getWebhookSubscription = query({
  args: {
    subscriptionId: v.id("webhookSubscriptions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.subscriptionId);
  },
});

// Mark webhook event as processed (for webhookEvents table)
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
    
    if (event) {
      await ctx.db.patch(event._id, {
        processed: args.processed,
        processedAt: args.processed ? Date.now() : undefined,
      });
    }
  },
});

// Mark webhook event as failed (for webhookEvents table)
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
    
    if (event) {
      await ctx.db.patch(event._id, {
        processed: false,
        error: args.error,
        processedAt: Date.now(),
      });
    }
  },
});

// Update webhook subscription event (for webhookSubscriptionEvents table)
export const updateWebhookSubscriptionEvent = internalMutation({
  args: {
    eventId: v.id("webhookSubscriptionEvents"),
    status: v.optional(v.union(v.literal("pending"), v.literal("success"), v.literal("failed"))),
    responseCode: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    retryCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: any = {};
    if (args.status !== undefined) updates.status = args.status;
    if (args.responseCode !== undefined) updates.responseCode = args.responseCode;
    if (args.responseBody !== undefined) updates.responseBody = args.responseBody;
    if (args.retryCount !== undefined) updates.retryCount = args.retryCount;
    if (args.status !== undefined && args.status !== "pending") {
      updates.completedAt = Date.now();
    }
    await ctx.db.patch(args.eventId, updates);
  },
});

// Update webhook event (for webhookEvents table)
export const updateWebhookEvent = mutation({
  args: {
    eventId: v.id("webhookEvents"),
    status: v.optional(v.union(v.literal("pending"), v.literal("success"), v.literal("failed"))),
    responseCode: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    retryCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: any = {};

    if (args.status !== undefined) updates.status = args.status;
    if (args.responseCode !== undefined) updates.responseCode = args.responseCode;
    if (args.responseBody !== undefined) updates.responseBody = args.responseBody;
    if (args.retryCount !== undefined) updates.retryCount = args.retryCount;
    if (args.status !== undefined && args.status !== "pending") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.eventId, updates);
  },
});
