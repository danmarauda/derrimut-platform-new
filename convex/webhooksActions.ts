"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import crypto from "crypto";

/**
 * Webhook Actions (Node.js runtime)
 * These actions use Node.js crypto for HMAC signatures
 */

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
        // Create signature using Node.js crypto
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
          responseBody: response.ok ? undefined : await response.text(),
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
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Log failed webhook
        await ctx.runMutation(internal.webhooks.logWebhookEvent, {
          subscriptionId: subscription._id,
          eventType: args.eventType,
          payload: JSON.stringify(args.payload),
          status: "failed",
          responseCode: 0,
          responseBody: errorMessage,
          retryCount: 0,
        });

        // Update failure count
        await ctx.runMutation(internal.webhooks.updateWebhookSubscriptionInternal, {
          subscriptionId: subscription._id,
          failureCount: subscription.failureCount + 1,
        });
      }
    }
  },
});

// Verify webhook signature (for incoming webhooks from external systems)
export const verifyWebhookSignature = internalAction({
  args: {
    payload: v.string(),
    signature: v.string(),
    secret: v.string(),
  },
  handler: async (_ctx, args) => {
    const expectedSignature = crypto
      .createHmac("sha256", args.secret)
      .update(args.payload)
      .digest("hex");

    return expectedSignature === args.signature;
  },
});

// Retry failed webhook
export const retryWebhook = internalAction({
  args: {
    eventId: v.id("webhookSubscriptionEvents"),
    event: v.object({
      eventType: v.string(),
      payload: v.string(),
      subscriptionId: v.id("webhookSubscriptions"),
    }),
    subscription: v.object({
      url: v.string(),
      secret: v.string(),
      isActive: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    if (!args.subscription.isActive) {
      throw new Error("Subscription not active");
    }

    try {
      const signature = crypto
        .createHmac("sha256", args.subscription.secret)
        .update(args.event.payload)
        .digest("hex");

      const response = await fetch(args.subscription.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": args.event.eventType,
          "X-Webhook-Timestamp": Date.now().toString(),
        },
        body: args.event.payload,
      });

      // Update event status
      await ctx.runMutation(internal.webhooks.updateWebhookSubscriptionEvent, {
        eventId: args.eventId,
        status: response.ok ? "success" : "failed",
        responseCode: response.status,
        responseBody: response.ok ? undefined : await response.text(),
        retryCount: 1,
      });

      return { success: response.ok };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Update event status
      await ctx.runMutation(internal.webhooks.updateWebhookSubscriptionEvent, {
        eventId: args.eventId,
        status: "failed",
        responseCode: 0,
        responseBody: errorMessage,
        retryCount: 1,
      });

      return { success: false, error: errorMessage };
    }
  },
});

