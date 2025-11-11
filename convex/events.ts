import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Events & Meetups System
 * Create and manage gym events, workshops, competitions, and social meetups
 */

// Create an event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    groupId: v.optional(v.id("groups")),
    locationId: v.optional(v.id("organizations")),
    eventType: v.union(
      v.literal("workshop"),
      v.literal("seminar"),
      v.literal("social"),
      v.literal("competition"),
      v.literal("charity"),
      v.literal("class")
    ),
    startDate: v.number(),
    endDate: v.number(),
    capacity: v.optional(v.number()),
    isPublic: v.boolean(),
    image: v.optional(v.string()),
    locationDetails: v.optional(v.string()),
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

    // If event is part of a group, verify user is member/admin
    if (args.groupId) {
      const membership = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_user", (q) =>
          q.eq("groupId", args.groupId!).eq("userId", user._id)
        )
        .first();

      if (!membership) {
        throw new Error("Must be a group member to create group events");
      }
    }

    const eventId = await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      organizerId: user._id,
      organizerClerkId: identity.subject,
      groupId: args.groupId,
      locationId: args.locationId,
      eventType: args.eventType,
      startDate: args.startDate,
      endDate: args.endDate,
      capacity: args.capacity,
      isPublic: args.isPublic,
      image: args.image,
      locationDetails: args.locationDetails,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return eventId;
  },
});

// RSVP to an event
export const rsvpToEvent = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("going"), v.literal("maybe"), v.literal("not_going")),
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

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if RSVP already exists
    const existingRSVP = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .first();

    if (existingRSVP) {
      // Update existing RSVP
      await ctx.db.patch(existingRSVP._id, {
        status: args.status,
        rsvpDate: Date.now(),
      });
    } else {
      // Create new RSVP
      await ctx.db.insert("eventRSVPs", {
        eventId: args.eventId,
        userId: user._id,
        clerkId: identity.subject,
        status: args.status,
        rsvpDate: Date.now(),
      });
    }

    // Send notification if going
    if (args.status === "going") {
      await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
        userId: user._id,
        clerkId: identity.subject,
        type: "booking",
        title: "Event RSVP Confirmed",
        message: `You're going to "${event.title}"`,
        link: `/events/${args.eventId}`,
        sendPush: true,
      });
    }

    return { success: true };
  },
});

// Get all events
export const getEvents = query({
  args: {
    eventType: v.optional(
      v.union(
        v.literal("workshop"),
        v.literal("seminar"),
        v.literal("social"),
        v.literal("competition"),
        v.literal("charity"),
        v.literal("class")
      )
    ),
    locationId: v.optional(v.id("organizations")),
    groupId: v.optional(v.id("groups")),
    upcomingOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = identity?.subject;

    let events = await ctx.db.query("events").collect();

    // Filter by type
    if (args.eventType) {
      events = events.filter((e) => e.eventType === args.eventType);
    }

    // Filter by location
    if (args.locationId) {
      events = events.filter((e) => e.locationId === args.locationId);
    }

    // Filter by group
    if (args.groupId) {
      events = events.filter((e) => e.groupId === args.groupId);
    }

    // Filter upcoming only
    if (args.upcomingOnly) {
      const now = Date.now();
      events = events.filter((e) => e.startDate >= now);
    }

    // If not authenticated, only show public events
    if (!clerkId) {
      events = events.filter((e) => e.isPublic);
    }

    // Sort by start date
    events.sort((a, b) => a.startDate - b.startDate);

    // Limit results
    const limit = args.limit || 50;
    events = events.slice(0, limit);

    // Enrich with organizer info and RSVP status
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const organizer = await ctx.db.get(event.organizerId);
        let rsvpStatus: "going" | "maybe" | "not_going" | null = null;

        if (clerkId) {
          const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

          if (user) {
            const rsvp = await ctx.db
              .query("eventRSVPs")
              .withIndex("by_event_user", (q) =>
                q.eq("eventId", event._id).eq("userId", user._id)
              )
              .first();

            if (rsvp) {
              rsvpStatus = rsvp.status;
            }
          }
        }

        // Get RSVP counts
        const rsvps = await ctx.db
          .query("eventRSVPs")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();

        const goingCount = rsvps.filter((r) => r.status === "going").length;
        const maybeCount = rsvps.filter((r) => r.status === "maybe").length;

        return {
          ...event,
          organizerName: organizer?.name || "Unknown",
          organizerImage: organizer?.image,
          rsvpStatus,
          goingCount,
          maybeCount,
          totalRSVPs: rsvps.length,
        };
      })
    );

    return enrichedEvents;
  },
});

// Get event details
export const getEventById = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = identity?.subject;

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user can view (public or RSVP'd)
    if (!event.isPublic && clerkId) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (user) {
        const rsvp = await ctx.db
          .query("eventRSVPs")
          .withIndex("by_event_user", (q) =>
            q.eq("eventId", args.eventId).eq("userId", user._id)
          )
          .first();

        if (!rsvp) {
          throw new Error("Event is private");
        }
      } else {
        throw new Error("Event is private");
      }
    }

    const organizer = await ctx.db.get(event.organizerId);
    const rsvps = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const enrichedRSVPs = await Promise.all(
      rsvps.map(async (rsvp) => {
        const user = await ctx.db.get(rsvp.userId);
        return {
          ...rsvp,
          userName: user?.name || "Unknown",
          userImage: user?.image,
          userEmail: user?.email,
        };
      })
    );

    let rsvpStatus: "going" | "maybe" | "not_going" | null = null;

    if (clerkId) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (user) {
        const rsvp = await ctx.db
          .query("eventRSVPs")
          .withIndex("by_event_user", (q) =>
            q.eq("eventId", args.eventId).eq("userId", user._id)
          )
          .first();

        if (rsvp) {
          rsvpStatus = rsvp.status;
        }
      }
    }

    const goingCount = enrichedRSVPs.filter((r) => r.status === "going").length;
    const maybeCount = enrichedRSVPs.filter((r) => r.status === "maybe").length;

    return {
      ...event,
      organizerName: organizer?.name || "Unknown",
      organizerImage: organizer?.image,
      rsvps: enrichedRSVPs,
      rsvpStatus,
      goingCount,
      maybeCount,
      totalRSVPs: enrichedRSVPs.length,
    };
  },
});

// Get user's events (events they're attending)
export const getUserEvents = query({
  args: {
    status: v.optional(v.union(v.literal("going"), v.literal("maybe"), v.literal("not_going"))),
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

    let rsvps = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Filter by status if provided
    if (args.status) {
      rsvps = rsvps.filter((r) => r.status === args.status);
    }

    const events = await Promise.all(
      rsvps.map(async (rsvp) => {
        const event = await ctx.db.get(rsvp.eventId);
        if (!event) return null;

        const organizer = await ctx.db.get(event.organizerId);
        return {
          ...event,
          rsvpStatus: rsvp.status,
          rsvpDate: rsvp.rsvpDate,
          organizerName: organizer?.name || "Unknown",
        };
      })
    );

    return events.filter(Boolean);
  },
});

// Get event calendar (events grouped by date)
export const getEventCalendar = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    locationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db
      .query("events")
      .withIndex("by_date", (q) => q.gte("startDate", args.startDate))
      .filter((q) => q.lte(q.field("startDate"), args.endDate))
      .collect();

    // Filter by location if provided
    if (args.locationId) {
      events = events.filter((e) => e.locationId === args.locationId);
    }

    // Group by date
    const calendar: Record<string, typeof events> = {};
    events.forEach((event) => {
      const dateKey = new Date(event.startDate).toISOString().split("T")[0];
      if (!calendar[dateKey]) {
        calendar[dateKey] = [];
      }
      calendar[dateKey].push(event);
    });

    return calendar;
  },
});

// Update event (organizer only)
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    capacity: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
    image: v.optional(v.string()),
    locationDetails: v.optional(v.string()),
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

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is organizer
    if (event.organizerId !== user._id) {
      throw new Error("Only the organizer can update this event");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.capacity !== undefined) updates.capacity = args.capacity;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;
    if (args.image !== undefined) updates.image = args.image;
    if (args.locationDetails !== undefined) updates.locationDetails = args.locationDetails;

    await ctx.db.patch(args.eventId, updates);

    return { success: true };
  },
});

// Delete event (organizer only)
export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
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

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is organizer
    if (event.organizerId !== user._id) {
      throw new Error("Only the organizer can delete this event");
    }

    // Delete all RSVPs
    const rsvps = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    await Promise.all(rsvps.map((rsvp) => ctx.db.delete(rsvp._id)));

    // Delete event
    await ctx.db.delete(args.eventId);

    return { success: true };
  },
});

